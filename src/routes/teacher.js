const { Router } = require('express');
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { NotFoundError } = require('../utils/errors');

const router = Router();
router.use(authenticate, requireRole('teacher'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const teacherSnap = await db().collection('teachers').doc(req.user.teacherId).get();
    if (!teacherSnap.exists) {
      throw new NotFoundError('Profil enseignant introuvable');
    }
    const teacher = { id: teacherSnap.id, ...teacherSnap.data() };

    const assignSnap = await db().collection('assignments')
      .where('teacherId', '==', req.user.teacherId)
      .where('isActive', '==', true)
      .get();

    const assignments = [];
    for (const doc of assignSnap.docs) {
      const a = doc.data();

      const clsSnap = await db().collection('classes').doc(a.classId).get();
      const className = clsSnap.exists ? clsSnap.data().name || '' : '';
      const stream = clsSnap.exists ? clsSnap.data().stream || '' : '';

      const subjSnap = await db().collection('subjects').doc(a.subjectId).get();
      const subjectName = subjSnap.exists ? subjSnap.data().name || '' : '';
      const defaultCoeff = subjSnap.exists ? subjSnap.data().defaultCoefficient || 0 : 0;

      const coeffSnap = await db().collection('coefficients')
        .where('classId', '==', a.classId)
        .where('subjectId', '==', a.subjectId)
        .limit(1)
        .get();
      const coefficient = coeffSnap.empty ? defaultCoeff : coeffSnap.docs[0].data().coefficient;

      const studentsSnap = await db().collection('students')
        .where('classId', '==', a.classId)
        .where('schoolYear', '==', a.schoolYear)
        .where('deletedAt', '==', null)
        .get();
      const studentsCount = studentsSnap.size;

      const periodsSnap = await db().collection('periods')
        .where('schoolYear', '==', a.schoolYear)
        .where('isOpenForGrades', '==', true)
        .get();
      const openPeriods = periodsSnap.docs.map((p) => ({ id: p.id, monthName: p.data().monthName }));

      assignments.push({
        classId: a.classId, className, stream,
        subjectId: a.subjectId, subjectName,
        coefficient,
        schoolYear: a.schoolYear,
        isOpenForGrades: !periodsSnap.empty,
        openPeriods,
        studentsCount,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          matricule: teacher.matricule,
        },
        assignments,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
