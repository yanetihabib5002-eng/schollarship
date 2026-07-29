const { db } = require('../config/firebase');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');

const COLLECTION = 'assignments';

async function createAssignment(data) {
  const teacherSnap = await db().collection('teachers').doc(data.teacherId).get();
  if (!teacherSnap.exists || teacherSnap.data().deletedAt) {
    throw new NotFoundError('Enseignant introuvable');
  }

  const classSnap = await db().collection('classes').doc(data.classId).get();
  if (!classSnap.exists || classSnap.data().deletedAt) {
    throw new NotFoundError('Classe introuvable');
  }

  const subjectSnap = await db().collection('subjects').doc(data.subjectId).get();
  if (!subjectSnap.exists || subjectSnap.data().deletedAt) {
    throw new NotFoundError('Matière introuvable');
  }

  const existing = await db().collection(COLLECTION)
    .where('teacherId', '==', data.teacherId)
    .where('classId', '==', data.classId)
    .where('subjectId', '==', data.subjectId)
    .where('schoolYear', '==', data.schoolYear)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new ConflictError('Cette affectation existe déjà (enseignant + classe + matière + année)');
  }

  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();
  const assignmentData = {
    id: ref.id,
    teacherId: data.teacherId,
    classId: data.classId,
    subjectId: data.subjectId,
    schoolYear: data.schoolYear,
    isActive: true,
    createdAt: now,
  };

  await ref.set(assignmentData);

  const teacherData = teacherSnap.data();
  const className = classSnap.data().name || '';
  const subjectName = subjectSnap.data().name || '';

  await createAuditLog({
    action: 'CREATE_ASSIGNMENT',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'assignment',
    targetId: ref.id,
    details: {
      teacherName: `${teacherData.firstName} ${teacherData.lastName}`,
      className,
      subjectName,
      schoolYear: data.schoolYear,
    },
  });

  return {
    ...assignmentData,
    teacherName: `${teacherData.firstName} ${teacherData.lastName}`,
    className,
    subjectName,
  };
}

async function listAssignments(query = {}) {
  const { teacherId, classId, subjectId, schoolYear, isActive } = query;

  let ref = db().collection(COLLECTION);
  if (teacherId) ref = ref.where('teacherId', '==', teacherId);
  if (classId) ref = ref.where('classId', '==', classId);
  if (subjectId) ref = ref.where('subjectId', '==', subjectId);
  if (schoolYear) ref = ref.where('schoolYear', '==', schoolYear);
  if (isActive !== undefined) {
    ref = ref.where('isActive', '==', isActive === 'true' || isActive === true);
  }

  const snap = await ref.get();
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const results = [];
  for (const item of data) {
    let teacherName = '', className = '', subjectName = '';

    const tSnap = await db().collection('teachers').doc(item.teacherId).get();
    if (tSnap.exists) {
      const td = tSnap.data();
      teacherName = `${td.firstName || ''} ${td.lastName || ''}`.trim();
    }

    const cSnap = await db().collection('classes').doc(item.classId).get();
    if (cSnap.exists) className = cSnap.data().name || '';

    const sSnap = await db().collection('subjects').doc(item.subjectId).get();
    if (sSnap.exists) subjectName = sSnap.data().name || '';

    results.push({ ...item, teacherName, className, subjectName });
  }

  return results;
}

async function getAssignment(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Affectation introuvable');

  const item = { id: snap.id, ...snap.data() };

  let teacherName = '', className = '', subjectName = '';
  const tSnap = await db().collection('teachers').doc(item.teacherId).get();
  if (tSnap.exists) {
    const td = tSnap.data();
    teacherName = `${td.firstName || ''} ${td.lastName || ''}`.trim();
  }
  const cSnap = await db().collection('classes').doc(item.classId).get();
  if (cSnap.exists) className = cSnap.data().name || '';
  const sSnap = await db().collection('subjects').doc(item.subjectId).get();
  if (sSnap.exists) subjectName = sSnap.data().name || '';

  return { ...item, teacherName, className, subjectName };
}

async function deleteAssignment(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Affectation introuvable');

  const data = snap.data();
  await snap.ref.delete();

  await createAuditLog({
    action: 'DELETE_ASSIGNMENT',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'assignment',
    targetId: id,
    details: { teacherId: data.teacherId, classId: data.classId, subjectId: data.subjectId },
  });

  return { message: 'Affectation supprimée' };
}

async function createMultipleAssignments(data) {
  const { teacherId, classIds, subjectIds, schoolYear } = data;

  const [teacherSnap, ...rest] = await Promise.all([
    db().collection('teachers').doc(teacherId).get(),
    ...classIds.map((id) => db().collection('classes').doc(id).get()),
    ...subjectIds.map((id) => db().collection('subjects').doc(id).get()),
  ]);
  if (!teacherSnap.exists || teacherSnap.data().deletedAt) throw new NotFoundError('Enseignant introuvable');

  const classSnaps = rest.slice(0, classIds.length);
  const subjectSnaps = rest.slice(classIds.length);
  const classMap = {};
  const subjectMap = {};
  for (const snap of classSnaps) {
    if (snap.exists && !snap.data().deletedAt) classMap[snap.id] = snap.data().name;
  }
  for (const snap of subjectSnaps) {
    if (snap.exists && !snap.data().deletedAt) subjectMap[snap.id] = snap.data().name;
  }

  const existing = await db().collection(COLLECTION)
    .where('teacherId', '==', teacherId)
    .where('schoolYear', '==', schoolYear)
    .get();
  const existingSet = new Set();
  existing.docs.forEach((d) => {
    const c = d.data();
    existingSet.add(`${c.classId}_${c.subjectId}`);
  });

  const now = new Date().toISOString();
  const batch = db().batch();
  const created = [];
  const errors = [];

  for (const classId of classIds) {
    if (!classMap[classId]) { errors.push({ classId, subjectId: '', message: 'Classe introuvable' }); continue; }
    for (const subjectId of subjectIds) {
      if (!subjectMap[subjectId]) { errors.push({ classId, subjectId, message: 'Matière introuvable' }); continue; }
      if (existingSet.has(`${classId}_${subjectId}`)) { errors.push({ classId, subjectId, message: 'Existe déjà' }); continue; }
      const ref = db().collection(COLLECTION).doc();
      batch.set(ref, { id: ref.id, teacherId, classId, subjectId, schoolYear, isActive: true, createdAt: now });
      created.push({ id: ref.id, teacherId, classId, subjectId, schoolYear, isActive: true, createdAt: now, teacherName: `${teacherSnap.data().firstName || ''} ${teacherSnap.data().lastName || ''}`.trim(), className: classMap[classId], subjectName: subjectMap[subjectId] });
    }
  }

  await batch.commit();

  const teacherData = teacherSnap.data();
  await createAuditLog({
    action: 'CREATE_MULTIPLE_ASSIGNMENTS',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'assignment',
    targetId: `${teacherId}_${schoolYear}`,
    details: { teacherName: `${teacherData.firstName} ${teacherData.lastName}`, totalCreated: created.length, totalErrors: errors.length, schoolYear },
  });

  return { created, errors };
}

module.exports = { createAssignment, listAssignments, getAssignment, deleteAssignment, createMultipleAssignments };
