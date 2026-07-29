const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { softDelete } = require('./firestoreService');

const COLLECTION = 'classes';

async function createClass(data) {
  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();
  const classData = { id: ref.id, ...data, createdAt: now, deletedAt: null };
  await ref.set(classData);
  await createAuditLog({
    action: 'CREATE_CLASS', actorId: 'system', actorRole: 'admin',
    targetType: 'class', targetId: ref.id, details: { name: data.name },
  });
  return { ...classData };
}

async function listClasses(query = {}) {
  const { stream, sortBy = 'order', sortOrder = 'asc' } = query;
  let ref = db().collection(COLLECTION).where('deletedAt', '==', null);
  if (stream) ref = ref.where('stream', '==', stream);
  ref = ref.orderBy(sortBy, sortOrder);
  const snap = await ref.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getClass(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Classe introuvable');
  return { id: snap.id, ...snap.data() };
}

async function updateClass(id, data) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Classe introuvable');
  const now = new Date().toISOString();
  await snap.ref.update({ ...data, updatedAt: now });
  await createAuditLog({
    action: 'UPDATE_CLASS', actorId: 'system', actorRole: 'admin',
    targetType: 'class', targetId: id, details: { changes: Object.keys(data) },
  });
  const updated = await snap.ref.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteClass(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Classe introuvable');
  await softDelete(COLLECTION, id);
  await createAuditLog({
    action: 'DELETE_CLASS', actorId: 'system', actorRole: 'admin',
    targetType: 'class', targetId: id,
  });
  return { message: 'Classe supprimée (soft delete)' };
}

module.exports = { createClass, listClasses, getClass, updateClass, deleteClass };
