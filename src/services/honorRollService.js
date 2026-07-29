const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { generateHonorRoll } = require('./pdfService');

const COLLECTION = 'honorRolls';

async function generate(data) {
  const { classId, trimester, schoolYear, topCount = 5 } = data;

  const classSnap = await db().collection('classes').doc(classId).get();
  if (!classSnap.exists) throw new NotFoundError('Classe introuvable');

  const pdfBuffer = await generateHonorRoll(classId, trimester, schoolYear, topCount);

  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();
  const record = {
    id: ref.id,
    classId,
    schoolYear,
    trimester,
    topCount,
    pdfData: pdfBuffer.toString('base64'),
    generatedAt: now,
    generatedBy: 'system',
  };
  await ref.set(record);

  await createAuditLog({
    action: 'GENERATE_HONOR_ROLL',
    actorId: 'system', actorRole: 'admin',
    targetType: 'honorRoll',
    targetId: classId,
    details: { classId, trimester, schoolYear, topCount },
  });

  return {
    id: ref.id,
    classId,
    className: classSnap.data().name || '',
    trimester,
    schoolYear,
    topCount,
    generatedAt: now,
    pdfUrl: `/api/v1/honor-rolls/${ref.id}/pdf`,
  };
}

async function list(query = {}) {
  const { classId, trimester, schoolYear } = query;
  let ref = db().collection(COLLECTION);
  if (classId) ref = ref.where('classId', '==', classId);
  if (trimester) ref = ref.where('trimester', '==', Number(trimester));
  if (schoolYear) ref = ref.where('schoolYear', '==', schoolYear);
  ref = ref.orderBy('generatedAt', 'desc');

  const snap = await ref.get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      classId: data.classId,
      trimester: data.trimester,
      schoolYear: data.schoolYear,
      topCount: data.topCount,
      generatedAt: data.generatedAt,
      pdfUrl: `/api/v1/honor-rolls/${d.id}/pdf`,
    };
  });
}

async function getPdf(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Tableau d\'honneur introuvable');
  return Buffer.from(snap.data().pdfData, 'base64');
}

module.exports = { generate, list, getPdf };
