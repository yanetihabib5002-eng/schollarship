const { db } = require('../config/firebase');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { softDelete } = require('./firestoreService');

const COLLECTION = 'subjects';

async function createSubject(data) {
  const existing = await db().collection(COLLECTION)
    .where('code', '==', data.code).where('deletedAt', '==', null).limit(1).get();
  if (!existing.empty) throw new ConflictError('Une matière avec ce code existe déjà');

  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();
  const subjectData = { id: ref.id, ...data, createdAt: now, deletedAt: null };
  await ref.set(subjectData);
  await createAuditLog({
    action: 'CREATE_SUBJECT', actorId: 'system', actorRole: 'admin',
    targetType: 'subject', targetId: ref.id, details: { code: data.code },
  });
  return { ...subjectData };
}

async function listSubjects(query = {}) {
  const { stream, sortBy = 'name', sortOrder = 'asc' } = query;
  let ref = db().collection(COLLECTION).where('deletedAt', '==', null);
  if (stream && stream !== 'all') ref = ref.where('stream', '==', stream);
  ref = ref.orderBy(sortBy, sortOrder);
  const snap = await ref.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getSubject(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Matière introuvable');
  return { id: snap.id, ...snap.data() };
}

async function updateSubject(id, data) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Matière introuvable');

  if (data.code) {
    const dup = await db().collection(COLLECTION)
      .where('code', '==', data.code).where('deletedAt', '==', null).limit(1).get();
    if (!dup.empty && dup.docs[0].id !== id) throw new ConflictError('Code déjà utilisé');
  }

  const now = new Date().toISOString();
  await snap.ref.update({ ...data, updatedAt: now });
  await createAuditLog({
    action: 'UPDATE_SUBJECT', actorId: 'system', actorRole: 'admin',
    targetType: 'subject', targetId: id, details: { changes: Object.keys(data) },
  });
  const updated = await snap.ref.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteSubject(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Matière introuvable');
  await softDelete(COLLECTION, id);
  await createAuditLog({
    action: 'DELETE_SUBJECT', actorId: 'system', actorRole: 'admin',
    targetType: 'subject', targetId: id,
  });
  return { message: 'Matière supprimée (soft delete)' };
}

module.exports = { createSubject, listSubjects, getSubject, updateSubject, deleteSubject };
