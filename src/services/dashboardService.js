const { db } = require('../config/firebase');

async function getOverview() {
  const [
    studentsSnap, teachersSnap, classesSnap, subjectsSnap,
    gradesSnap, periodsSnap, settingsSnap, reportCardsSnap,
  ] = await Promise.all([
    db().collection('students').where('deletedAt', '==', null).get(),
    db().collection('teachers').where('deletedAt', '==', null).get(),
    db().collection('classes').where('deletedAt', '==', null).get(),
    db().collection('subjects').where('deletedAt', '==', null).get(),
    db().collection('grades').get(),
    db().collection('periods').get(),
    db().collection('settings').doc('global').get(),
    db().collection('reportCards').get(),
  ]);

  const currentSchoolYear = settingsSnap.exists ? settingsSnap.data().currentSchoolYear || '2025-2026' : '2025-2026';

  const submitted = gradesSnap.docs.filter(d => d.data().status === 'submitted').length;
  const validated = gradesSnap.docs.filter(d => d.data().status === 'validated').length;
  const draft = gradesSnap.docs.filter(d => d.data().status === 'draft' || !d.data().status).length;

  const gradesByPeriod = {};
  for (const d of gradesSnap.docs) {
    const g = d.data();
    if (g.status === 'validated') {
      gradesByPeriod[g.periodId] = (gradesByPeriod[g.periodId] || 0) + 1;
    }
  }

  const reportCardsCount = reportCardsSnap.size;
  const periods = periodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const openPeriods = periods.filter(p => p.isOpenForGrades);
  const validatedPeriods = periods.filter(p => p.isValidated);
  const currentPeriod = periods.find(p => {
    if (!p.startDate) return false;
    const now = new Date();
    const start = new Date(p.startDate + 'T00:00:00');
    const end = new Date(p.endDate + 'T23:59:59');
    return now >= start && now <= end;
  });

  const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const classes = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const teachers = teachersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const studentsByClass = {};
  for (const s of students) {
    const cid = s.classId || 'unknown';
    if (!studentsByClass[cid]) studentsByClass[cid] = 0;
    studentsByClass[cid]++;
  }

  let totalWeighted = 0;
  let totalStudentsWithGrades = 0;
  for (const s of students) {
    const sGrades = gradesSnap.docs.filter(d => d.data().studentId === s.id && d.data().status === 'validated');
    if (sGrades.length > 0) {
      const avg = sGrades.reduce((sum, d) => sum + d.data().value, 0) / sGrades.length;
      totalWeighted += avg;
      totalStudentsWithGrades++;
    }
  }
  const overallAverage = totalStudentsWithGrades > 0 ? Math.round((totalWeighted / totalStudentsWithGrades) * 100) / 100 : 0;

  const passedStudents = students.filter(s => {
    const sGrades = gradesSnap.docs.filter(d => d.data().studentId === s.id && d.data().status === 'validated');
    if (sGrades.length === 0) return false;
    const avg = sGrades.reduce((sum, d) => sum + d.data().value, 0) / sGrades.length;
    return avg >= 10;
  });
  const passRate = totalStudentsWithGrades > 0 ? Math.round((passedStudents.length / totalStudentsWithGrades) * 100) : 0;

  const studentsByStream = { general_francophone: 0, technique: 0, anglophone: 0 };
  const teachersByStream = { general_francophone: 0, technique: 0, anglophone: 0 };
  const classesByStream = { general_francophone: 0, technique: 0, anglophone: 0 };

  for (const c of classes) {
    const stream = c.stream || 'general_francophone';
    if (!classesByStream[stream]) classesByStream[stream] = 0;
    classesByStream[stream]++;
    const classStudents = students.filter(s => s.classId === c.id);
    if (!studentsByStream[stream]) studentsByStream[stream] = 0;
    studentsByStream[stream] += classStudents.length;
  }

  for (const t of teachers) {
    const stream = t.stream || 'general_francophone';
    if (!teachersByStream[stream]) teachersByStream[stream] = 0;
    teachersByStream[stream]++;
  }

  const gradesByTrimester = {};
  for (const d of gradesSnap.docs) {
    const g = d.data();
    if (g.status !== 'validated') continue;
    const period = periods.find(p => p.id === g.periodId);
    if (!period) continue;
    const t = period.trimester || 1;
    if (!gradesByTrimester[t]) gradesByTrimester[t] = [];
    gradesByTrimester[t].push(g.value);
  }
  const trimesterStats = {};
  for (const [t, vals] of Object.entries(gradesByTrimester)) {
    trimesterStats[t] = {
      average: vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0,
      max: vals.length > 0 ? Math.max(...vals) : 0,
      min: vals.length > 0 ? Math.min(...vals) : 0,
      count: vals.length,
    };
  }

  const gradesByMonth = {};
  for (const d of reportCardsSnap.docs) {
    const r = d.data();
    const date = new Date(r.generatedAt || r.createdAt || Date.now());
    const month = date.toLocaleString('fr-FR', { month: 'short' });
    gradesByMonth[month] = (gradesByMonth[month] || 0) + 1;
  }

  return {
    totalStudents: studentsSnap.size,
    totalTeachers: teachersSnap.size,
    totalClasses: classesSnap.size,
    totalSubjects: subjectsSnap.size,
    totalReportCards: reportCardsCount,
    gradesSubmitted: submitted,
    gradesValidated: validated,
    gradesDraft: draft,
    currentSchoolYear,
    overallAverage,
    passRate,
    studentsByClass,
    openPeriodsCount: openPeriods.length,
    validatedPeriodsCount: validatedPeriods.length,
    currentPeriod: currentPeriod ? { id: currentPeriod.id, name: currentPeriod.monthName, endDate: currentPeriod.endDate } : null,
    byStream: {
      general_francophone: { students: studentsByStream.general_francophone, teachers: teachersByStream.general_francophone, classes: classesByStream.general_francophone },
      technique: { students: studentsByStream.technique, teachers: teachersByStream.technique, classes: classesByStream.technique },
      anglophone: { students: studentsByStream.anglophone, teachers: teachersByStream.anglophone, classes: classesByStream.anglophone },
    },
    trimesterStats,
    reportCardsByMonth: gradesByMonth,
  };
}

async function getChartData() {
  const [studentsSnap, classesSnap, teachersSnap, subjectsSnap, gradesSnap, periodsSnap] = await Promise.all([
    db().collection('students').where('deletedAt', '==', null).get(),
    db().collection('classes').where('deletedAt', '==', null).get(),
    db().collection('teachers').where('deletedAt', '==', null).get(),
    db().collection('subjects').where('deletedAt', '==', null).get(),
    db().collection('grades').get(),
    db().collection('periods').get(),
  ]);

  const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const classes = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const teachers = teachersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const subjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const periods = periodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allGrades = gradesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const studentDistribution = [
    { name: 'Général', value: 0, color: '#2563EB' },
    { name: 'Technique', value: 0, color: '#8B5CF6' },
    { name: 'Anglophone', value: 0, color: '#22C55E' },
  ];

  const streamMap = { general_francophone: 0, technique: 1, anglophone: 2 };
  for (const s of students) {
    const c = classes.find(cl => cl.id === s.classId);
    const stream = c?.stream || 'general_francophone';
    const idx = streamMap[stream] ?? 0;
    studentDistribution[idx].value++;
  }

  const trimesterGrades = {};
  for (const g of allGrades) {
    if (g.status !== 'validated') continue;
    const p = periods.find(per => per.id === g.periodId);
    const t = p?.trimester || 1;
    if (!trimesterGrades[t]) trimesterGrades[t] = [];
    trimesterGrades[t].push(g.value);
  }
  const gradesByTrimester = [1, 2, 3].map(t => ({
    name: `T${t}`,
    Moyenne: (trimesterGrades[t]?.length || 0) > 0 ? Math.round((trimesterGrades[t].reduce((a, b) => a + b, 0) / trimesterGrades[t].length) * 10) / 10 : 0,
    Max: trimesterGrades[t]?.length > 0 ? Math.max(...trimesterGrades[t]) : 0,
    Min: trimesterGrades[t]?.length > 0 ? Math.min(...trimesterGrades[t]) : 0,
  }));

  const averagesByClass = classes.map(c => {
    const classGrades = allGrades.filter(g => g.classId === c.id && g.status === 'validated');
    const avg = classGrades.length > 0 ? classGrades.reduce((s, g) => s + g.value, 0) / classGrades.length : 0;
    return { name: c.name, moyenne: Math.round(avg * 10) / 10 };
  });

  const teacherDistribution = [
    { name: 'Général', value: 0, color: '#2563EB' },
    { name: 'Technique', value: 0, color: '#8B5CF6' },
    { name: 'Anglophone', value: 0, color: '#22C55E' },
  ];
  for (const t of teachers) {
    const stream = t.stream || 'general_francophone';
    const idx = streamMap[stream] ?? 0;
    teacherDistribution[idx].value++;
  }

  const now = new Date();
  const academicProgress = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('fr-FR', { month: 'short' });
    const monthNum = d.getMonth() + 1;
    const relevantPeriods = periods.filter(p => p.month === monthNum);
    const periodIds = relevantPeriods.map(p => p.id);
    const monthGrades = allGrades.filter(g => g.status === 'validated' && periodIds.includes(g.periodId));
    const avg = monthGrades.length > 0 ? Math.round((monthGrades.reduce((s, g) => s + g.value, 0) / monthGrades.length) * 10) / 10 : 0;
    const valCount = monthGrades.length;
    academicProgress.push({ month: monthLabel, moyenne: avg, Validé: valCount });
  }

  const reportCardsSnap = await db().collection('reportCards').get();
  const reportCardsByMonth = {};
  for (const d of reportCardsSnap.docs) {
    const r = d.data();
    const date = new Date(r.generatedAt || r.createdAt || Date.now());
    const monthLabel = date.toLocaleString('fr-FR', { month: 'short' });
    reportCardsByMonth[monthLabel] = (reportCardsByMonth[monthLabel] || 0) + 1;
  }
  const months = ['Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui'];
  const reportCardsData = months.map(m => ({ name: m, bulletins: reportCardsByMonth[m] || 0 }));

  return {
    studentDistribution,
    gradesByTrimester,
    averagesByClass,
    teacherDistribution,
    academicProgress,
    reportCardsData,
  };
}

async function getActivities() {
  const snap = await db().collection('auditLogs')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();

  const activities = [];
  for (const d of snap.docs) {
    const log = d.data();
    const timeAgo = getTimeAgo(log.timestamp);
    activities.push({
      id: d.id,
      action: log.action,
      actorRole: log.actorRole,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details || {},
      timeAgo,
      timestamp: log.timestamp,
    });
  }

  if (activities.length === 0) {
    const [studentsSnap, classesSnap, gradesSnap] = await Promise.all([
      db().collection('students').where('deletedAt', '==', null).get(),
      db().collection('classes').where('deletedAt', '==', null).get(),
      db().collection('grades').get(),
    ]);
    activities.push(
      { id: '1', action: 'STUDENTS_COUNT', targetType: 'student', details: { count: studentsSnap.size }, timeAgo: 'live', timestamp: new Date().toISOString() },
      { id: '2', action: 'CLASSES_COUNT', targetType: 'class', details: { count: classesSnap.size }, timeAgo: 'live', timestamp: new Date().toISOString() },
      { id: '3', action: 'GRADES_COUNT', targetType: 'grade', details: { count: gradesSnap.size }, timeAgo: 'live', timestamp: new Date().toISOString() },
    );
  }

  return activities;
}

async function getAlerts() {
  const alerts = [];

  const [periodsSnap, gradesSnap, teachersSnap, reportCardsSnap] = await Promise.all([
    db().collection('periods').get(),
    db().collection('grades').get(),
    db().collection('teachers').where('deletedAt', '==', null).get(),
    db().collection('reportCards').get(),
  ]);

  const periods = periodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const now = new Date();

  for (const p of periods) {
    if (p.isValidated) continue;
    if (!p.endDate) continue;
    const end = new Date(p.endDate + 'T23:59:59');
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) {
      alerts.push({
        type: 'period_closing',
        severity: diffDays <= 1 ? 'high' : 'medium',
        title: `La période ${p.monthName} ferme dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`,
        description: `Fin de saisie : ${p.endDate}`,
        periodId: p.id,
        color: diffDays <= 1 ? '#EF4444' : '#F59E0B',
        bg: diffDays <= 1 ? '#FEE2E2' : '#FEF3C7',
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'periods_pending',
      severity: 'low',
      title: 'Toutes les périodes sont à jour',
      description: 'Aucune période ne ferme dans les 3 prochains jours',
      color: '#22C55E',
      bg: '#DCFCE7',
    });
  }

  const teachersWithGrades = new Set();
  for (const d of gradesSnap.docs) {
    const g = d.data();
    if (g.teacherId) teachersWithGrades.add(g.teacherId);
  }
  const teachersWithoutGrades = teachersSnap.docs.filter(t => !teachersWithGrades.has(t.id));
  if (teachersWithoutGrades.length > 0) {
    alerts.push({
      type: 'missing_grades',
      severity: 'high',
      title: `${teachersWithoutGrades.length} enseignant${teachersWithoutGrades.length > 1 ? 's' : ''} n'ont pas saisi leurs notes`,
      description: 'Ils doivent soumettre leurs notes avant la clôture',
      count: teachersWithoutGrades.length,
      color: '#EF4444',
      bg: '#FEE2E2',
    });
  }

  const reportCardsByClass = {};
  for (const d of reportCardsSnap.docs) {
    const r = d.data();
    if (r.classId) reportCardsByClass[r.classId] = (reportCardsByClass[r.classId] || 0) + 1;
  }

  return alerts;
}

async function getCalendar() {
  const periodsSnap = await db().collection('periods').get();
  const periods = periodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const now = new Date();
  const events = [];

  for (const p of periods) {
    if (p.isValidated) {
      events.push({
        id: p.id,
        date: p.endDate || '',
        label: `Validation T${p.trimester} - ${p.monthName}`,
        type: 'validation',
        icon: 'CheckCircle',
        color: '#22C55E',
        bg: '#DCFCE7',
        monthDay: p.endDate ? new Date(p.endDate + 'T00:00:00').getDate() : 1,
        month: p.endDate ? new Date(p.endDate + 'T00:00:00').toLocaleString('fr-FR', { month: 'short' }) : '',
      });
    } else if (p.isOpenForGrades) {
      events.push({
        id: p.id,
        date: p.endDate || '',
        label: `Saisie notes - ${p.monthName}`,
        type: 'period',
        icon: 'Edit',
        color: '#2563EB',
        bg: '#EFF6FF',
        monthDay: p.endDate ? new Date(p.endDate + 'T00:00:00').getDate() : 1,
        month: p.endDate ? new Date(p.endDate + 'T00:00:00').toLocaleString('fr-FR', { month: 'short' }) : '',
      });
    } else {
      events.push({
        id: p.id,
        date: p.startDate || '',
        label: `${p.monthName} T${p.trimester}`,
        type: 'upcoming',
        icon: 'Calendar',
        color: '#64748B',
        bg: '#F1F5F9',
        monthDay: p.startDate ? new Date(p.startDate + 'T00:00:00').getDate() : 1,
        month: p.startDate ? new Date(p.startDate + 'T00:00:00').toLocaleString('fr-FR', { month: 'short' }) : '',
      });
    }
  }

  return events.slice(0, 5);
}

function getTimeAgo(timestamp) {
  if (!timestamp) return 'Récemment';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

module.exports = { getOverview, getChartData, getActivities, getAlerts, getCalendar };
