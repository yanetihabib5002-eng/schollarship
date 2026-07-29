const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { hashPassword } = require('./authService');
const { paginate, getById, update, softDelete } = require('./firestoreService');

const SALT_ROUNDS = 12;
const COLLECTION = 'teachers';
const USERS_COLLECTION = 'users';

function generateMatricule(seed = 0) {
  const year = new Date().getFullYear();
  const seq = String(seed + 1).padStart(4, '0');
  return `TCH-${year}-${seq}`;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd + '!';
}

async function getNextMatricule() {
  const snap = await db().collection(COLLECTION)
    .where('deletedAt', '==', null)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) return generateMatricule(0);
  const last = snap.docs[0].data();
  const lastSeq = parseInt(last.matricule?.split('-')[2] || '0', 10);
  return generateMatricule(lastSeq);
}

async function createTeacher(data) {
  if (data.email) {
    const emailExists = await db().collection(USERS_COLLECTION)
      .where('email', '==', data.email)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (!emailExists.empty) {
      throw new ConflictError('Un compte avec cet email existe déjà');
    }
  }

  const matricule = await getNextMatricule();
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const teacherRef = db().collection(COLLECTION).doc();
  const now = new Date().toISOString();

  const teacherData = {
    id: teacherRef.id,
    matricule,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email || '',
    phone: data.phone || '',
    specialty: data.specialty || '',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await teacherRef.set(teacherData);

  const userRef = db().collection(USERS_COLLECTION).doc();
  await userRef.set({
    id: userRef.id,
    email: data.email || `${matricule.toLowerCase()}@ecole.local`,
    passwordHash,
    role: 'teacher',
    teacherId: teacherRef.id,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  await createAuditLog({
    action: 'CREATE_TEACHER',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'teacher',
    targetId: teacherRef.id,
    details: { matricule },
  });

  return {
    ...teacherData,
    temporaryPassword: tempPassword,
  };
}

async function listTeachers(query = {}) {
  const { page = 1, pageSize = 20, search, isActive, sortBy = 'lastName', sortOrder = 'asc' } = query;

  let all = await db().collection(COLLECTION)
    .where('deletedAt', '==', null)
    .orderBy(sortBy, sortOrder)
    .get();

  let data = all.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (search) {
    const term = search.toLowerCase();
    data = data.filter(
      (t) =>
        t.firstName.toLowerCase().includes(term) ||
        t.lastName.toLowerCase().includes(term) ||
        t.matricule.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
    );
  }

  const results = [];
  for (const teacher of data) {
    const userSnap = await db().collection(USERS_COLLECTION)
      .where('teacherId', '==', teacher.id)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    const isActiveUser = userSnap.empty ? true : userSnap.docs[0].data().isActive !== false;
    results.push({ ...teacher, isActive: isActiveUser });
  }

  let filtered = results;
  if (isActive !== undefined) {
    const target = isActive === 'true' || isActive === true;
    filtered = results.filter((t) => t.isActive === target);
  }

  const total = filtered.length;
  const offset = (page - 1) * pageSize;
  const paged = filtered.slice(offset, offset + pageSize);

  return {
    data: paged,
    meta: { page: Number(page), pageSize: Number(pageSize), total },
  };
}

async function getTeacher(id) {
  const teacher = await getById(COLLECTION, id);
  if (!teacher || teacher.deletedAt) {
    throw new NotFoundError('Enseignant introuvable');
  }

  const userSnap = await db().collection(USERS_COLLECTION)
    .where('teacherId', '==', id)
    .where('deletedAt', '==', null)
    .limit(1)
    .get();
  const isActive = userSnap.empty ? true : userSnap.docs[0].data().isActive !== false;

  return { ...teacher, isActive };
}

async function updateTeacher(id, data) {
  const teacher = await getById(COLLECTION, id);
  if (!teacher || teacher.deletedAt) {
    throw new NotFoundError('Enseignant introuvable');
  }

  if (data.email) {
    const emailSnap = await db().collection(USERS_COLLECTION)
      .where('email', '==', data.email)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (!emailSnap.empty) {
      const existingUser = emailSnap.docs[0].data();
      if (existingUser.teacherId !== id) {
        throw new ConflictError('Un autre enseignant utilise déjà cet email');
      }
    }
  }

  const updated = await update(COLLECTION, id, data);
  if (!updated) throw new NotFoundError('Enseignant introuvable');

  if (data.email) {
    const userSnap = await db().collection(USERS_COLLECTION)
      .where('teacherId', '==', id)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (!userSnap.empty) {
      await userSnap.docs[0].ref.update({ email: data.email, updatedAt: new Date().toISOString() });
    }
  }

  await createAuditLog({
    action: 'UPDATE_TEACHER',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'teacher',
    targetId: id,
    details: { changes: Object.keys(data) },
  });

  return getTeacher(id);
}

async function deleteTeacher(id) {
  const teacher = await getById(COLLECTION, id);
  if (!teacher || teacher.deletedAt) {
    throw new NotFoundError('Enseignant introuvable');
  }

  await softDelete(COLLECTION, id);

  const userSnap = await db().collection(USERS_COLLECTION)
    .where('teacherId', '==', id)
    .where('deletedAt', '==', null)
    .limit(1)
    .get();
  if (!userSnap.empty) {
    const now = new Date().toISOString();
    await userSnap.docs[0].ref.update({ deletedAt: now, isActive: false, updatedAt: now });
  }

  await createAuditLog({
    action: 'DELETE_TEACHER',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'teacher',
    targetId: id,
  });

  return { message: 'Enseignant supprimé (soft delete)' };
}

async function toggleActive(id) {
  const teacher = await getById(COLLECTION, id);
  if (!teacher || teacher.deletedAt) {
    throw new NotFoundError('Enseignant introuvable');
  }

  const userSnap = await db().collection(USERS_COLLECTION)
    .where('teacherId', '==', id)
    .where('deletedAt', '==', null)
    .limit(1)
    .get();

  if (userSnap.empty) {
    throw new NotFoundError('Compte utilisateur associé introuvable');
  }

  const userRef = userSnap.docs[0].ref;
  const userData = userSnap.docs[0].data();
  const newStatus = userData.isActive === false;

  await userRef.update({ isActive: newStatus, updatedAt: new Date().toISOString() });

  await createAuditLog({
    action: newStatus ? 'ACTIVATE_TEACHER' : 'DEACTIVATE_TEACHER',
    actorId: 'system',
    actorRole: 'admin',
    targetType: 'teacher',
    targetId: id,
  });

  return { isActive: newStatus };
}

module.exports = {
  createTeacher, listTeachers, getTeacher, updateTeacher, deleteTeacher, toggleActive,
};
