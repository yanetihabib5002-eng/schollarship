const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const MONGO_URI = process.env.MONGO_URI || '';
let DB_NAME = process.env.MONGO_DB_NAME || 'schollarship';

let client = null;
let mdb = null;
let mongod = null;

class DocumentSnapshot {
  constructor(ref, data) {
    this.ref = ref;
    if (data) {
      const { _id, ...rest } = data;
      this._data = rest;
      this.id = rest.id || ref._id;
    } else {
      this._data = null;
      this.id = null;
    }
    this.exists = !!data;
  }
  data() { return this._data || {}; }
}

class QuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }
  forEach(fn) { this.docs.forEach(fn); }
}

class Query {
  constructor(collectionName, filters = [], sortField = null, sortDir = 'asc', limitVal = null, skipVal = null) {
    this._collectionName = collectionName;
    this._filters = filters;
    this._sortField = sortField;
    this._sortDir = sortDir;
    this._limitVal = limitVal;
    this._skipVal = skipVal;
  }

  where(field, op, value) {
    return new Query(this._collectionName, [...this._filters, { field, op, value }], this._sortField, this._sortDir, this._limitVal, this._skipVal);
  }

  orderBy(field, dir = 'asc') {
    return new Query(this._collectionName, this._filters, field, dir, this._limitVal, this._skipVal);
  }

  limit(n) {
    return new Query(this._collectionName, this._filters, this._sortField, this._sortDir, n, this._skipVal);
  }

  offset(n) {
    return new Query(this._collectionName, this._filters, this._sortField, this._sortDir, this._limitVal, n);
  }

  async get() {
    const col = mdb.collection(this._collectionName);
    let query = {};
    for (const f of this._filters) {
      if (f.op === '==') query[f.field] = f.value;
    }
    let cursor = col.find(query);
    if (this._sortField) {
      cursor = cursor.sort(this._sortField, this._sortDir === 'asc' ? 1 : -1);
    }
    if (this._skipVal) {
      cursor = cursor.skip(this._skipVal);
    }
    if (this._limitVal) {
      cursor = cursor.limit(this._limitVal);
    }
    const docs = await cursor.toArray();
    const snapshots = docs.map((d) => {
      const ref = new DocumentReference(this._collectionName, d.id || d._id.toString());
      return new DocumentSnapshot(ref, { ...d, id: d.id || d._id.toString() });
    });
    return new QuerySnapshot(snapshots);
  }

  async add(data) {
    return collectionRef(this._collectionName).add(data);
  }
}

class DocumentReference {
  constructor(collectionName, id) {
    this._collectionName = collectionName;
    this._id = id;
    this.id = id;
  }

  async get() {
    const col = mdb.collection(this._collectionName);
    const doc = await col.findOne({ id: this._id });
    if (doc) return new DocumentSnapshot(this, { ...doc, id: doc.id || doc._id.toString() });
    return new DocumentSnapshot(this, null);
  }

  async set(data) {
    const col = mdb.collection(this._collectionName);
    const { _id, ...rest } = data;
    await col.updateOne(
      { id: this._id },
      { $set: { ...rest, id: this._id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    const { ...result } = rest;
    return { id: this._id, ...result };
  }

  async update(data) {
    const col = mdb.collection(this._collectionName);
    delete data.id;
    await col.updateOne(
      { id: this._id },
      { $set: { ...data, updatedAt: new Date().toISOString() } }
    );
  }

  async delete() {
    const col = mdb.collection(this._collectionName);
    await col.deleteOne({ id: this._id });
  }
}

function collectionRef(collectionName) {
  return {
    doc(id) {
      if (!id) id = require('crypto').randomBytes(12).toString('hex');
      return new DocumentReference(collectionName, id);
    },
    where(field, op, value) {
      return new Query(collectionName, [{ field, op, value }]);
    },
    orderBy(field, dir) {
      return new Query(collectionName, [], field, dir);
    },
    limit(n) {
      return new Query(collectionName, [], null, null, n);
    },
    async get() {
      const col = mdb.collection(collectionName);
      const docs = await col.find({}).toArray();
      const snapshots = docs.map((d) => {
        const ref = new DocumentReference(collectionName, d.id || d._id.toString());
        return new DocumentSnapshot(ref, { ...d, id: d.id || d._id.toString() });
      });
      return new QuerySnapshot(snapshots);
    },
    async add(data) {
      const col = mdb.collection(collectionName);
      const id = data.id || require('crypto').randomBytes(12).toString('hex');
      const doc = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      delete doc._id;
      await col.insertOne(doc);
      return new DocumentReference(collectionName, id);
    },
  };
}

class BatchWriter {
  constructor() {
    this._operations = [];
  }

  set(ref, data) {
    this._operations.push({ type: 'set', ref, data });
  }

  update(ref, data) {
    this._operations.push({ type: 'update', ref, data });
  }

  delete(ref) {
    this._operations.push({ type: 'delete', ref });
  }

  async commit() {
    for (const op of this._operations) {
      if (op.type === 'set') await op.ref.set(op.data);
      else if (op.type === 'update') await op.ref.update(op.data);
      else if (op.type === 'delete') await op.ref.delete();
    }
  }
}

function db() {
  if (!mdb) throw new Error('Database not initialized');
  return {
    collection(name) {
      return collectionRef(name);
    },
    batch() {
      return new BatchWriter();
    },
  };
}

async function connect() {
  if (mdb) return mdb;
  let uri;
  if (MONGO_URI) {
    uri = MONGO_URI;
    console.log('[DB] Connexion à MongoDB Atlas...');
  } else {
    const path = require('path');
    mongod = await MongoMemoryServer.create({
      instance: { dbPath: path.join(process.cwd(), 'data'), storageEngine: 'wiredTiger' },
    });
    uri = mongod.getUri();
    console.log('[DB] Démarrage MongoDB embarqué...');
  }
  client = new MongoClient(uri);
  await client.connect();
  mdb = client.db(DB_NAME);
  console.log(`[DB] MongoDB prêt - ${DB_NAME}`);
  return mdb;
}

async function disconnect() {
  if (client) try { await client.close(); } catch {}
  if (mongod) try { await mongod.stop(); } catch {}
}

module.exports = { db, connect, disconnect };
