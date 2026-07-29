const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { generateReportCard } = require('./pdfService');
const { createNotification } = require('../utils/notify');

const COLLECTION = 'reportCards';

async function generate(data) {
  const { classId, trimester, schoolYear } = data;

  const classSnap = await db().collection('classes').doc(classId).get();
  if (!classSnap.exists) throw new NotFoundError('Classe introuvable');

  const studentsSnap = await db().collection('students')
    .where('classId', '==', classId)
    .where('schoolYear', '==', schoolYear)
    .where('deletedAt', '==', null)
    .get();

  if (studentsSnap.empty) throw new NotFoundError('Aucun élève dans cette classe');

  const generated = [];
  for (const sDoc of studentsSnap.docs) {
    const studentId = sDoc.id;
    const pdfBuffer = await generateReportCard(studentId, classId, trimester, schoolYear);

    const now = new Date().toISOString();
    const ref = db().collection(COLLECTION).doc();
    const record = {
      id: ref.id,
      studentId,
      classId,
      schoolYear,
      trimester,
      pdfData: pdfBuffer.toString('base64'),
      generatedAt: now,
      generatedBy: 'system',
      isSent: false,
      sentAt: null,
      sentMethod: null,
      deletedAt: null,
    };
    await ref.set(record);

    generated.push({ studentId, reportCardId: ref.id });
  }

  await createAuditLog({
    action: 'GENERATE_REPORT_CARDS',
    actorId: 'system', actorRole: 'admin',
    targetType: 'reportCard',
    targetId: classId,
    details: { classId, trimester, schoolYear, count: generated.length },
  });

  await createNotification({
    title: `Bulletins générés — ${classSnap.data().name}`,
    message: `${generated.length} bulletin${generated.length > 1 ? 's' : ''} créé${generated.length > 1 ? 's' : ''} pour le T${trimester} de ${schoolYear}`,
    type: 'success',
  });

  return {
    classId,
    className: classSnap.data().name || '',
    trimester,
    schoolYear,
    generated: generated.length,
    reportCards: generated,
  };
}

async function list(query = {}) {
  const { classId, trimester, schoolYear, studentId } = query;
  let ref = db().collection(COLLECTION);
  if (classId) ref = ref.where('classId', '==', classId);
  if (trimester) ref = ref.where('trimester', '==', Number(trimester));
  if (schoolYear) ref = ref.where('schoolYear', '==', schoolYear);
  if (studentId) ref = ref.where('studentId', '==', studentId);

  const snap = await ref.get();
  const results = [];

  for (const d of snap.docs) {
    const data = d.data();
    if (data.deletedAt) continue;

    let studentName = '';
    const sSnap = await db().collection('students').doc(data.studentId).get();
    if (sSnap.exists) {
      const s = sSnap.data();
      studentName = `${s.firstName} ${s.lastName}`;
    }
    results.push({
      id: d.id,
      studentId: data.studentId,
      studentName,
      classId: data.classId,
      trimester: data.trimester,
      schoolYear: data.schoolYear,
      generatedAt: data.generatedAt,
      isSent: data.isSent,
      pdfUrl: `/api/v1/report-cards/${d.id}/pdf`,
    });
  }

  return results;
}

async function getPdf(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) throw new NotFoundError('Bulletin introuvable');
  const data = snap.data();
  return Buffer.from(data.pdfData, 'base64');
}

async function remove(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Bulletin introuvable');
  await db().collection(COLLECTION).doc(id).update({ deletedAt: new Date().toISOString() });
  return { id };
}

module.exports = { generate, list, getPdf, remove };
