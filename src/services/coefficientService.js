const { db } = require('../config/firebase');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');

const COLLECTION = 'coefficients';

/**
 * Règle de précédence :
 * Si un coefficient spécifique existe pour (classId, subjectId), il prévaut.
 * Sinon, le defaultCoefficient de la matière est utilisé.
 * Résultat : effectiveCoefficient = specific ?? default
 */

async function setCoefficient(data) {
  const classSnap = await db().collection('classes').doc(data.classId).get();
  if (!classSnap.exists) throw new NotFoundError('Classe introuvable');

  const subjectSnap = await db().collection('subjects').doc(data.subjectId).get();
  if (!subjectSnap.exists) throw new NotFoundError('Matière introuvable');

  const existing = await db().collection(COLLECTION)
    .where('classId', '==', data.classId)
    .where('subjectId', '==', data.subjectId)
    .limit(1)
    .get();

  const now = new Date().toISOString();

  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.update({ coefficient: data.coefficient, updatedAt: now });
    await createAuditLog({
      action: 'UPDATE_COEFFICIENT', actorId: 'system', actorRole: 'admin',
      targetType: 'coefficient', targetId: doc.id,
      details: { classId: data.classId, subjectId: data.subjectId, newValue: data.coefficient },
    });
    const updated = await doc.ref.get();
    return { id: updated.id, ...updated.data() };
  }

  const ref = db().collection(COLLECTION).doc();
  const coefData = {
    id: ref.id,
    classId: data.classId,
    subjectId: data.subjectId,
    coefficient: data.coefficient,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(coefData);
  await createAuditLog({
    action: 'CREATE_COEFFICIENT', actorId: 'system', actorRole: 'admin',
    targetType: 'coefficient', targetId: ref.id,
    details: { classId: data.classId, subjectId: data.subjectId, value: data.coefficient },
  });
  return { ...coefData };
}

async function listCoefficients(query = {}) {
  const { classId, subjectId } = query;
  let ref = db().collection(COLLECTION);
  if (classId) ref = ref.where('classId', '==', classId);
  if (subjectId) ref = ref.where('subjectId', '==', subjectId);

  const snap = await ref.get();
  const coefs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const results = [];
  for (const coef of coefs) {
    let className = '';
    let subjectName = '';
    let defaultCoefficient = null;

    if (coef.classId) {
      const cSnap = await db().collection('classes').doc(coef.classId).get();
      if (cSnap.exists) className = cSnap.data().name || '';
    }
    if (coef.subjectId) {
      const sSnap = await db().collection('subjects').doc(coef.subjectId).get();
      if (sSnap.exists) {
        subjectName = sSnap.data().name || '';
        defaultCoefficient = sSnap.data().defaultCoefficient || null;
      }
    }

    results.push({
      ...coef,
      className,
      subjectName,
      defaultCoefficient,
      effectiveCoefficient: coef.coefficient,
      source: 'specific',
    });
  }

  return results;
}

/**
 * Retourne le coefficient effectif pour un couple (classId, subjectId)
 * Règle : spécifique prévaut, sinon défaut
 */
async function getEffectiveCoefficient(classId, subjectId) {
  const specific = await db().collection(COLLECTION)
    .where('classId', '==', classId)
    .where('subjectId', '==', subjectId)
    .limit(1)
    .get();

  if (!specific.empty) {
    return { coefficient: specific.docs[0].data().coefficient, source: 'specific' };
  }

  const subjSnap = await db().collection('subjects').doc(subjectId).get();
  if (!subjSnap.exists) throw new NotFoundError('Matière introuvable');

  return { coefficient: subjSnap.data().defaultCoefficient, source: 'default' };
}

async function deleteCoefficient(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Coefficient introuvable');

  const data = snap.data();
  await snap.ref.delete();

  await createAuditLog({
    action: 'DELETE_COEFFICIENT', actorId: 'system', actorRole: 'admin',
    targetType: 'coefficient', targetId: id,
    details: { classId: data.classId, subjectId: data.subjectId },
  });

  return { message: 'Coefficient supprimé. La matière utilisera son coefficient par défaut.' };
}

module.exports = { setCoefficient, listCoefficients, getEffectiveCoefficient, deleteCoefficient };
