const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');

async function getOverview() {
  const studentsSnap = await db().collection('students').where('deletedAt', '==', null).get();
  const teachersSnap = await db().collection('teachers').where('deletedAt', '==', null).get();
  const classesSnap = await db().collection('classes').where('deletedAt', '==', null).get();
  const subjectsSnap = await db().collection('subjects').where('deletedAt', '==', null).get();

  const gradesAll = await db().collection('grades').get();
  const submitted = gradesAll.docs.filter((d) => d.data().status === 'submitted').length;
  const validated = gradesAll.docs.filter((d) => d.data().status === 'validated').length;

  const settingsSnap = await db().collection('settings').doc('global').get();
  const currentSchoolYear = settingsSnap.exists ? settingsSnap.data().currentSchoolYear || 'N/A' : 'N/A';

  return {
    totalStudents: studentsSnap.size,
    totalTeachers: teachersSnap.size,
    totalClasses: classesSnap.size,
    totalSubjects: subjectsSnap.size,
    gradesSubmitted: submitted,
    gradesValidated: validated,
    currentSchoolYear,
  };
}

async function getClassTrimesterStats(classId, trimester) {
  const classSnap = await db().collection('classes').doc(classId).get();
  if (!classSnap.exists) throw new NotFoundError('Classe introuvable');
  const className = classSnap.data().name || '';

  const settingsSnap = await db().collection('settings').doc('global').get();
  const schoolYear = settingsSnap.exists ? settingsSnap.data().currentSchoolYear || '2025-2026' : '2025-2026';

  const periodsSnap = await db().collection('periods')
    .where('schoolYear', '==', schoolYear)
    .where('trimester', '==', Number(trimester))
    .get();
  const periodIds = periodsSnap.docs.map((d) => d.id);

  const studentsSnap = await db().collection('students')
    .where('classId', '==', classId)
    .where('schoolYear', '==', schoolYear)
    .where('deletedAt', '==', null)
    .get();

  const subjectsSnap = await db().collection('subjects').get();
  const subjects = {};
  subjectsSnap.docs.forEach((d) => { subjects[d.id] = d.data(); });

  const ranking = [];
  for (const sDoc of studentsSnap.docs) {
    const sData = sDoc.data();
    const gradesSnap = await db().collection('grades')
      .where('studentId', '==', sDoc.id)
      .where('classId', '==', classId)
      .get();
    const sGrades = gradesSnap.docs.map((g) => g.data()).filter((g) => periodIds.includes(g.periodId));

    const subjectGroups = {};
    for (const g of sGrades) {
      if (!subjectGroups[g.subjectId]) subjectGroups[g.subjectId] = [];
      subjectGroups[g.subjectId].push(g);
    }

    let totalWeighted = 0;
    let totalCoef = 0;
    for (const [subjId, gList] of Object.entries(subjectGroups)) {
      const subj = subjects[subjId] || { defaultCoefficient: 1 };
      const coeffSnap = await db().collection('coefficients')
        .where('classId', '==', classId).where('subjectId', '==', subjId).limit(1).get();
      const coeff = coeffSnap.empty ? subj.defaultCoefficient : coeffSnap.docs[0].data().coefficient;
      const avg = gList.reduce((s, g) => s + g.value, 0) / gList.length;
      totalWeighted += avg * coeff;
      totalCoef += coeff;
    }
    const avg = totalCoef > 0 ? totalWeighted / totalCoef : 0;
    ranking.push({
      studentId: sDoc.id,
      studentName: `${sData.firstName} ${sData.lastName}`,
      average: Math.round(avg * 100) / 100,
    });
  }

  ranking.sort((a, b) => b.average - a.average);
  const ranked = ranking.map((s, i) => ({ rank: i + 1, ...s }));

  const classAverage = ranking.length > 0
    ? Math.round((ranking.reduce((s, r) => s + r.average, 0) / ranking.length) * 100) / 100
    : 0;

  return {
    className,
    trimester: Number(trimester),
    schoolYear,
    studentsCount: studentsSnap.size,
    classAverage,
    bestAverage: ranked.length > 0 ? ranked[0].average : 0,
    worstAverage: ranked.length > 0 ? ranked[ranked.length - 1].average : 0,
    ranking: ranked,
  };
}

module.exports = { getOverview, getClassTrimesterStats };
