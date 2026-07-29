const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');

const COLLECTION = 'periods';

async function listPeriods(query = {}) {
  const { schoolYear } = query;
  let ref = db().collection(COLLECTION);
  if (schoolYear) ref = ref.where('schoolYear', '==', schoolYear);
  ref = ref.orderBy('month', 'asc');
  const snap = await ref.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function createPeriod(data) {
  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();
  const periodData = {
    id: ref.id, ...data,
    isOpenForGrades: false,
    isValidated: false,
    createdAt: now,
  };
  await ref.set(periodData);
  return { ...periodData };
}

async function toggleOpen(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Période introuvable');

  const current = snap.data();
  if (current.isValidated) {
    throw new NotFoundError('Impossible d\'ouvrir une période déjà validée');
  }

  const newValue = !current.isOpenForGrades;
  await snap.ref.update({ isOpenForGrades: newValue, updatedAt: new Date().toISOString() });

  await createAuditLog({
    action: newValue ? 'OPEN_PERIOD' : 'CLOSE_PERIOD',
    actorId: 'system', actorRole: 'admin',
    targetType: 'period', targetId: id,
    details: { month: current.monthName, schoolYear: current.schoolYear },
  });

  return { id, isOpenForGrades: newValue, monthName: current.monthName };
}

async function validatePeriod(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Période introuvable');

  const current = snap.data();
  if (current.isValidated) {
    throw new NotFoundError('Période déjà validée');
  }

  const gradeSnap = await db().collection('grades')
    .where('periodId', '==', id)
    .where('status', '==', 'submitted')
    .get();

  const batch = db().batch();
  gradeSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { status: 'validated', validatedAt: new Date().toISOString() });
  });
  await batch.commit();

  await snap.ref.update({ isValidated: true, updatedAt: new Date().toISOString() });

  await createAuditLog({
    action: 'VALIDATE_PERIOD',
    actorId: 'system', actorRole: 'admin',
    targetType: 'period', targetId: id,
    details: { month: current.monthName, gradesValidated: gradeSnap.size },
  });

  return {
    id,
    isValidated: true,
    monthName: current.monthName,
    gradesValidated: gradeSnap.size,
    message: `${gradeSnap.size} notes validées pour ${current.monthName} ${current.schoolYear}`,
  };
}

module.exports = { listPeriods, createPeriod, toggleOpen, validatePeriod };
