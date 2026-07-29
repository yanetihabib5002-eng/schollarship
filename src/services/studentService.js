const { db } = require('../config/firebase');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { softDelete } = require('./firestoreService');

const COLLECTION = 'students';

function generateStudentCode(seed = 0) {
  const year = new Date().getFullYear();
  const seq = String(seed + 1).padStart(4, '0');
  return `STU-${year}-${seq}`;
}

async function getNextStudentCode() {
  const snap = await db().collection(COLLECTION)
    .where('deletedAt', '==', null)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) return generateStudentCode(0);
  const last = snap.docs[0].data();
  const lastSeq = parseInt(last.studentCode?.split('-')[2] || '0', 10);
  return generateStudentCode(lastSeq);
}

async function createStudent(data) {
  const studentCode = await getNextStudentCode();

  const classSnap = await db().collection('classes').doc(data.classId).get();
  if (!classSnap.exists) {
    throw new NotFoundError('Classe introuvable');
  }

  const now = new Date().toISOString();
  const ref = db().collection(COLLECTION).doc();

  const studentData = {
    id: ref.id,
    studentCode,
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate: data.birthDate,
    birthPlace: data.birthPlace || '',
    gender: data.gender,
    classId: data.classId,
    schoolYear: data.schoolYear,
    photoUrl: data.photoUrl || '',
    parentName: data.parentName || '',
    parentPhone: data.parentPhone || '',
    parentEmail: data.parentEmail || '',
    hasSmartphone: data.hasSmartphone || false,
    isFirstYear: data.isFirstYear !== false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await ref.set(studentData);

  await createAuditLog({
    action: 'CREATE_STUDENT',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'student',
    targetId: ref.id,
    details: { studentCode, classId: data.classId },
  });

  return { id: ref.id, studentCode, ...studentData };
}

async function listStudents(query = {}) {
  const { page = 1, pageSize = 20, search, classId, schoolYear, sortBy = 'lastName', sortOrder = 'asc' } = query;

  let ref = db().collection(COLLECTION).where('deletedAt', '==', null);

  if (classId) ref = ref.where('classId', '==', classId);
  if (schoolYear) ref = ref.where('schoolYear', '==', schoolYear);

  ref = ref.orderBy(sortBy, sortOrder);

  const snap = await ref.get();
  let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (search) {
    const term = search.toLowerCase();
    data = data.filter(
      (s) =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        s.studentCode.toLowerCase().includes(term) ||
        s.parentName.toLowerCase().includes(term)
    );
  }

  const total = data.length;
  const offset = (page - 1) * pageSize;
  const paged = data.slice(offset, offset + pageSize);

  const results = [];
  for (const student of paged) {
    let className = '';
    if (student.classId) {
      const clsSnap = await db().collection('classes').doc(student.classId).get();
      if (clsSnap.exists) className = clsSnap.data().name || '';
    }
    results.push({ ...student, className });
  }

  return {
    data: results,
    meta: { page: Number(page), pageSize: Number(pageSize), total },
  };
}

async function getStudent(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) {
    throw new NotFoundError('Élève introuvable');
  }

  const student = { id: snap.id, ...snap.data() };

  let className = '';
  if (student.classId) {
    const clsSnap = await db().collection('classes').doc(student.classId).get();
    if (clsSnap.exists) className = clsSnap.data().name || '';
  }

  return { ...student, className };
}

async function updateStudent(id, data) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) {
    throw new NotFoundError('Élève introuvable');
  }

  if (data.classId) {
    const clsSnap = await db().collection('classes').doc(data.classId).get();
    if (!clsSnap.exists) {
      throw new NotFoundError('Classe introuvable');
    }
  }

  const now = new Date().toISOString();
  const updates = { ...data, updatedAt: now };

  await db().collection(COLLECTION).doc(id).update(updates);

  await createAuditLog({
    action: 'UPDATE_STUDENT',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'student',
    targetId: id,
    details: { changes: Object.keys(data) },
  });

  return getStudent(id);
}

async function deleteStudent(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists || snap.data().deletedAt) {
    throw new NotFoundError('Élève introuvable');
  }

  await softDelete(COLLECTION, id);

  await createAuditLog({
    action: 'DELETE_STUDENT',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'student',
    targetId: id,
  });

  return { message: 'Élève supprimé (soft delete)' };
}

module.exports = {
  createStudent, listStudents, getStudent, updateStudent, deleteStudent,
};
