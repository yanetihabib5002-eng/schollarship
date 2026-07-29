const { db } = require('../config/firebase');

const DEFAULT_PAGE_SIZE = 20;

function doc(collection, id) {
  return db().collection(collection).doc(id);
}

async function getById(collection, id) {
  const snap = await doc(collection, id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

async function getAll(collection, options = {}) {
  let query = db().collection(collection);

  if (options.filters) {
    for (const [field, value] of Object.entries(options.filters)) {
      query = query.where(field, '==', value);
    }
  }

  if (options.orderBy) {
    query = query.orderBy(options.orderBy, options.orderDir || 'asc');
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getActive(collection, options = {}) {
  const filters = { ...options.filters, deletedAt: null };
  return getAll(collection, { ...options, filters });
}

async function create(collection, data) {
  const ref = db().collection(collection).doc();
  const now = new Date().toISOString();
  const docData = {
    ...data,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await ref.set(docData);
  return { id: ref.id, ...docData };
}

async function update(collection, id, data) {
  const ref = doc(collection, id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const updates = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updates);
  return { id, ...snap.data(), ...updates };
}

async function softDelete(collection, id) {
  const ref = doc(collection, id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const now = new Date().toISOString();
  await ref.update({ deletedAt: now, updatedAt: now });
  return { id, deletedAt: now };
}

async function paginate(collection, options = {}) {
  const page = options.page || 1;
  const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = db().collection(collection);

  if (options.filters) {
    for (const [field, value] of Object.entries(options.filters)) {
      query = query.where(field, '==', value);
    }
  }

  if (options.orderBy) {
    query = query.orderBy(options.orderBy, options.orderDir || 'asc');
  }

  const countSnap = await query.get();
  const total = countSnap.size;

  const limitedSnap = await query.offset(offset).limit(pageSize).get();

  const data = limitedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    data,
    meta: { page, pageSize, total },
  };
}

async function exists(collection, field, value) {
  const snap = await db().collection(collection).where(field, '==', value).limit(1).get();
  return !snap.empty;
}

async function findByField(collection, field, value) {
  const snap = await db().collection(collection).where(field, '==', value).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

async function query(collection, conditions = [], options = {}) {
  let query = db().collection(collection);

  for (const [field, op, value] of conditions) {
    query = query.where(field, op, value);
  }

  if (options.orderBy) {
    query = query.orderBy(options.orderBy, options.orderDir || 'asc');
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

module.exports = {
  getById, getAll, getActive, create, update, softDelete,
  paginate, exists, findByField, query, doc,
};
