const { db } = require('../config/firebase');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');
const { getEffectiveCoefficient } = require('./coefficientService');
const { createNotification } = require('../utils/notify');

const COLLECTION = 'grades';
const CURRENT_YEAR = '2025-2026';

async function listGrades(query = {}, user) {
  const { classId, subjectId, periodId, studentId, status, schoolYear = CURRENT_YEAR } = query;

  let ref = db().collection(COLLECTION);

  if (classId) ref = ref.where('classId', '==', classId);
  if (subjectId) ref = ref.where('subjectId', '==', subjectId);
  if (periodId) ref = ref.where('periodId', '==', periodId);
  if (studentId) ref = ref.where('studentId', '==', studentId);
  if (status) ref = ref.where('status', '==', status);

  if (user.role === 'teacher') {
    const assignSnap = await db().collection('assignments')
      .where('teacherId', '==', user.teacherId)
      .where('schoolYear', '==', schoolYear)
      .where('isActive', '==', true)
      .get();

    const allowedSubjects = new Set();
    const allowedClasses = new Set();
    assignSnap.docs.forEach((d) => {
      const a = d.data();
      allowedSubjects.add(a.subjectId);
      allowedClasses.add(a.classId);
    });

    if (subjectId && !allowedSubjects.has(subjectId)) return [];
    if (classId && !allowedClasses.has(classId)) return [];

    if (!subjectId) {
      ref = ref.where('subjectId', 'in', [...allowedSubjects]);
    }
    if (!classId) {
      ref = ref.where('classId', 'in', [...allowedClasses]);
    }
  }

  const snap = await ref.get();
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const results = [];
  for (const grade of data) {
    let studentName = '', subjectName = '', className = '';
    let coefficient = 0;
    let canEdit = false;

    const stuSnap = await db().collection('students').doc(grade.studentId).get();
    if (stuSnap.exists) {
      const s = stuSnap.data();
      studentName = `${s.firstName} ${s.lastName}`;
    }

    const subjSnap = await db().collection('subjects').doc(grade.subjectId).get();
    if (subjSnap.exists) subjectName = subjSnap.data().name || '';

    const clsSnap = await db().collection('classes').doc(grade.classId).get();
    if (clsSnap.exists) className = clsSnap.data().name || '';

    try {
      const eff = await getEffectiveCoefficient(grade.classId, grade.subjectId);
      coefficient = eff.coefficient;
    } catch {
      coefficient = 0;
    }

    if (user.role === 'admin') {
      canEdit = true;
    } else if (user.role === 'teacher') {
      canEdit = ['draft', 'reopened'].includes(grade.status);
    }

    let periodInfo = {};
    const perSnap = await db().collection('periods').doc(grade.periodId).get();
    if (perSnap.exists) {
      const p = perSnap.data();
      periodInfo = { month: p.monthName, monthNumber: p.month, trimester: p.trimester };
    }

    results.push({
      ...grade,
      studentName,
      subjectName,
      className,
      coefficient,
      weightedPoints: grade.value * coefficient,
      canEdit,
      ...periodInfo,
    });
  }

  return results;
}

async function batchUpsertGrades(data, user) {
  const { classId, subjectId, periodId, grades } = data;

  const periodSnap = await db().collection('periods').doc(periodId).get();
  if (!periodSnap.exists) throw new NotFoundError('Période introuvable');
  const period = periodSnap.data();

  if (user.role === 'teacher') {
    if (!period.isOpenForGrades) {
      throw new ForbiddenError('La saisie des notes est fermée pour cette période');
    }
    if (period.isValidated) {
      throw new ForbiddenError('Cette période est déjà validée');
    }

    const assignSnap = await db().collection('assignments')
      .where('teacherId', '==', user.teacherId)
      .where('classId', '==', classId)
      .where('subjectId', '==', subjectId)
      .where('schoolYear', '==', (period.schoolYear || CURRENT_YEAR))
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (assignSnap.empty) {
      throw new ForbiddenError('Vous n\'êtes pas affecté à cette classe/matière');
    }
  }

  const clsSnap = await db().collection('classes').doc(classId).get();
  if (!clsSnap.exists) throw new NotFoundError('Classe introuvable');

  const subjSnap = await db().collection('subjects').doc(subjectId).get();
  if (!subjSnap.exists) throw new NotFoundError('Matière introuvable');

  const errors = [];
  const now = new Date().toISOString();
  const batch = db().batch();
  let updated = 0;

  for (const g of grades) {
    try {
      const stuSnap = await db().collection('students').doc(g.studentId).get();
      if (!stuSnap.exists || stuSnap.data().deletedAt) {
        errors.push({ studentId: g.studentId, error: 'Élève introuvable' });
        continue;
      }

      if (g.value < 0 || g.value > 20) {
        errors.push({ studentId: g.studentId, value: g.value, error: 'Note hors limite (0-20)' });
        continue;
      }

      const existing = await db().collection(COLLECTION)
        .where('studentId', '==', g.studentId)
        .where('subjectId', '==', subjectId)
        .where('periodId', '==', periodId)
        .limit(1)
        .get();

      if (!existing.empty) {
        const doc = existing.docs[0];
        const currentStatus = doc.data().status;

        if (user.role === 'teacher' && currentStatus === 'validated') {
          errors.push({ studentId: g.studentId, error: 'Note déjà validée. Contactez l\'administrateur.' });
          continue;
        }

        if (user.role === 'teacher' && currentStatus === 'submitted') {
          errors.push({ studentId: g.studentId, error: 'Note déjà soumise. Déposez d\'abord ou attendez la réouverture.' });
          continue;
        }

        batch.update(doc.ref, {
          value: g.value,
          status: user.role === 'admin' ? doc.data().status : 'draft',
          teacherId: user.teacherId || user.id,
          updatedAt: now,
        });
      } else {
        const ref = db().collection(COLLECTION).doc();
        batch.set(ref, {
          id: ref.id,
          studentId: g.studentId,
          subjectId,
          classId,
          periodId,
          teacherId: user.teacherId || user.id,
          value: g.value,
          status: 'draft',
          validatedBy: null,
          validatedAt: null,
          createdAt: now,
          updatedAt: now,
        });
      }
      updated++;
    } catch (err) {
      errors.push({ studentId: g.studentId, error: err.message });
    }
  }

  if (updated > 0) {
    await batch.commit();
    const clsName = clsSnap.data().name || '';
    const subjName = subjSnap.data().name || '';
    await createNotification({
      title: `Notes enregistrées — ${clsName}`,
      message: `${updated} note${updated > 1 ? 's' : ''} enregistrée${updated > 1 ? 's' : ''} pour ${subjName}`,
      type: 'info',
    });
  }

  return { updated, errors, message: `${updated} notes enregistrées` };
}

async function submitGrade(id, user) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Note introuvable');

  const grade = { id: snap.id, ...snap.data() };

  if (user.role === 'teacher') {
    if (grade.teacherId !== user.teacherId) {
      throw new ForbiddenError('Vous ne pouvez soumettre que vos propres notes');
    }
  }

  if (grade.status === 'validated') {
    throw new ForbiddenError('Note déjà validée');
  }
  if (grade.status === 'submitted') {
    return { id, status: 'submitted', message: 'Note déjà soumise' };
  }

  await snap.ref.update({ status: 'submitted', updatedAt: new Date().toISOString() });

  await createNotification({
    title: 'Notes soumises pour validation',
    message: `Notes de ${grade.studentName || grade.studentId} soumises en ${grade.subjectName || grade.subjectId}`,
    type: 'warning',
  });

  return { id, status: 'submitted', message: 'Note soumise pour validation' };
}

async function validateBatch(data, user) {
  const { periodId, classId, subjectId } = data;

  let ref = db().collection(COLLECTION)
    .where('periodId', '==', periodId)
    .where('status', '==', 'submitted');

  if (classId) ref = ref.where('classId', '==', classId);
  if (subjectId) ref = ref.where('subjectId', '==', subjectId);

  const snap = await ref.get();
  const now = new Date().toISOString();
  const batch = db().batch();
  let count = 0;

  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'validated',
      validatedBy: user.id,
      validatedAt: now,
      updatedAt: now,
    });
    count++;
  });

  if (count > 0) await batch.commit();

  await createAuditLog({
    action: 'VALIDATE_GRADES_BATCH',
    actorId: user.id, actorRole: 'admin',
    targetType: 'grade',
    targetId: `${periodId}-${classId || '*'}-${subjectId || '*'}`,
    details: { count, periodId, classId, subjectId },
  });

  if (count > 0) {
    await createNotification({
      title: 'Notes validées',
      message: `${count} note${count > 1 ? 's' : ''} validée${count > 1 ? 's' : ''} par l'administrateur`,
      type: 'success',
    });
  }

  return { validated: count, message: `${count} notes validées` };
}

async function reopenGrade(id, user) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Note introuvable');

  const grade = snap.data();
  if (grade.status !== 'validated') {
    throw new ForbiddenError('Seules les notes validées peuvent être réouvertes');
  }

  await snap.ref.update({
    status: 'reopened',
    validatedBy: null,
    validatedAt: null,
    updatedAt: new Date().toISOString(),
  });

  await createAuditLog({
    action: 'REOPEN_GRADE',
    actorId: user.id, actorRole: 'admin',
    targetType: 'grade', targetId: id,
    details: { studentId: grade.studentId, subjectId: grade.subjectId },
  });

  return { id, status: 'reopened', message: 'Note réouverte pour modification' };
}

async function validateGrade(id, user) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Note introuvable');

  const grade = { id: snap.id, ...snap.data() };

  if (grade.status === 'validated') {
    return { id, status: 'validated', message: 'Note déjà validée' };
  }

  if (grade.status !== 'submitted') {
    throw new ForbiddenError('Seules les notes soumises peuvent être validées');
  }

  const now = new Date().toISOString();
  await snap.ref.update({
    status: 'validated',
    validatedBy: user.id,
    validatedAt: now,
    updatedAt: now,
  });

  await createAuditLog({
    action: 'VALIDATE_GRADE',
    actorId: user.id, actorRole: 'admin',
    targetType: 'grade', targetId: id,
    details: { studentId: grade.studentId, subjectId: grade.subjectId, value: grade.value },
  });

  return { id, status: 'validated', message: 'Note validée' };
}

module.exports = { listGrades, batchUpsertGrades, submitGrade, validateBatch, reopenGrade, validateGrade };
