const PDFDocument = require('pdfkit');
const { db } = require('../config/firebase');

// ── COLOUR PALETTE ──
const C = {
  primary: '#3B6FF6',
  primaryDark: '#1E40AF',
  primaryLight: '#EBF0FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  surface: '#F8FAFC',
  text: '#1E293B',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  white: '#FFFFFF',
  rowEven: '#F1F5F9',
  headerBg: '#1E293B',
};

function getSubjectMention(avg) {
  if (avg >= 16) return { label: 'TB', color: C.success };
  if (avg >= 14) return { label: 'B', color: C.primary };
  if (avg >= 12) return { label: 'AB', color: C.warning };
  if (avg >= 10) return { label: 'P', color: C.textMuted };
  return { label: 'I', color: C.danger };
}

function getOverallMention(avg) {
  if (avg >= 18) return 'Excellent';
  if (avg >= 16) return 'Très Bien';
  if (avg >= 14) return 'Bien';
  if (avg >= 12) return 'Assez Bien';
  if (avg >= 10) return 'Passable';
  return 'Insuffisant';
}

function getDecision(avg) {
  if (avg >= 16) return 'FÉLICITATIONS';
  if (avg >= 14) return 'TABLEAU D\'HONNEUR';
  if (avg >= 12) return 'ENCOURAGEMENTS';
  return '';
}

function roundedRect(doc, x, y, w, h, r) {
  doc.moveTo(x + r, y)
    .lineTo(x + w - r, y)
    .quadraticCurveTo(x + w, y, x + w, y + r)
    .lineTo(x + w, y + h - r)
    .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    .lineTo(x + r, y + h)
    .quadraticCurveTo(x, y + h, x, y + h - r)
    .lineTo(x, y + r)
    .quadraticCurveTo(x, y, x + r, y)
    .closePath();
}

async function generateReportCard(studentId, classId, trimester, schoolYear) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  // ── DATA FETCHING ──
  const studentSnap = await db().collection('students').doc(studentId).get();
  if (!studentSnap.exists) throw new Error('Élève introuvable');
  const student = studentSnap.data();

  const classSnap = await db().collection('classes').doc(classId).get();
  const className = classSnap.exists ? classSnap.data().name || '' : '';
  const classStream = classSnap.exists ? classSnap.data().stream || '' : '';

  const settingsSnap = await db().collection('settings').doc('global').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : {};
  const schoolName = settings.schoolName || 'Établissement Scolaire';
  const schoolPhone = settings.schoolPhone || '';
  const schoolEmail = settings.schoolEmail || '';
  const schoolAddress = settings.schoolAddress || '';

  const periodsSnap = await db().collection('periods')
    .where('schoolYear', '==', schoolYear)
    .where('trimester', '==', trimester)
    .orderBy('month', 'asc')
    .get();
  const periods = periodsSnap.docs.map((d) => d.data());

  const gradesSnap = await db().collection('grades')
    .where('studentId', '==', studentId)
    .where('classId', '==', classId)
    .get();
  const allGrades = gradesSnap.docs.map((d) => d.data());

  const subjectsSnap = await db().collection('subjects').get();
  const subjects = {};
  subjectsSnap.docs.forEach((d) => { subjects[d.id] = d.data(); });

  const periodIds = periods.map((p) => p.id);
  const trimesterGrades = allGrades.filter((g) => periodIds.includes(g.periodId));

  const subjectGrades = {};
  for (const g of trimesterGrades) {
    if (!subjectGrades[g.subjectId]) subjectGrades[g.subjectId] = [];
    subjectGrades[g.subjectId].push(g);
  }

  const subjectRows = [];
  let totalWeightedSum = 0;
  let totalCoefSum = 0;

  for (const [subjId, grades] of Object.entries(subjectGrades)) {
    const subj = subjects[subjId] || { name: 'Inconnue', defaultCoefficient: 1 };

    const coeffSnap = await db().collection('coefficients')
      .where('classId', '==', classId)
      .where('subjectId', '==', subjId)
      .limit(1)
      .get();
    const coefficient = coeffSnap.empty ? subj.defaultCoefficient : coeffSnap.docs[0].data().coefficient;

    const avg = grades.reduce((s, g) => s + g.value, 0) / grades.length;
    const weightedPoints = avg * coefficient;
    const mention = getSubjectMention(avg);

    subjectRows.push({
      subjectName: subj.name || subjId,
      coefficient,
      average: Math.round(avg * 100) / 100,
      weightedPoints: Math.round(weightedPoints * 100) / 100,
      mention,
    });

    totalWeightedSum += weightedPoints;
    totalCoefSum += coefficient;
  }

  const overallAverage = totalCoefSum > 0 ? Math.round((totalWeightedSum / totalCoefSum) * 100) / 100 : 0;
  const overallMention = getOverallMention(overallAverage);
  const decision = getDecision(overallAverage);

  // ── RANK CALCULATION ──
  const allStudentsSnap = await db().collection('students')
    .where('classId', '==', classId)
    .where('schoolYear', '==', schoolYear)
    .where('deletedAt', '==', null)
    .get();

  const studentAverages = [];
  for (const sDoc of allStudentsSnap.docs) {
    const sId = sDoc.id;
    const sGradesSnap = await db().collection('grades')
      .where('studentId', '==', sId)
      .where('classId', '==', classId)
      .get();
    const sGrades = sGradesSnap.docs.map((g) => g.data());
    const sPeriodGrades = sGrades.filter((g) => periodIds.includes(g.periodId));
    const sSubjectGrades = {};
    for (const g of sPeriodGrades) {
      if (!sSubjectGrades[g.subjectId]) sSubjectGrades[g.subjectId] = [];
      sSubjectGrades[g.subjectId].push(g);
    }
    let sWeightedSum = 0;
    let sCoefSum = 0;
    for (const [subjId, gList] of Object.entries(sSubjectGrades)) {
      const subj = subjects[subjId] || { defaultCoefficient: 1 };
      const coeffSnap = await db().collection('coefficients')
        .where('classId', '==', classId).where('subjectId', '==', subjId).limit(1).get();
      const coeff = coeffSnap.empty ? subj.defaultCoefficient : coeffSnap.docs[0].data().coefficient;
      const avg = gList.reduce((s, g) => s + g.value, 0) / gList.length;
      sWeightedSum += avg * coeff;
      sCoefSum += coeff;
    }
    const sAvg = sCoefSum > 0 ? sWeightedSum / sCoefSum : 0;
    studentAverages.push({ studentId: sId, average: sAvg });
  }

  studentAverages.sort((a, b) => b.average - a.average);
  const rank = studentAverages.findIndex((s) => s.studentId === studentId) + 1;
  const totalStudents = allStudentsSnap.size;

  const trimesterNames = { 1: 'Premier', 2: 'Deuxième', 3: 'Troisième' };

  // ── HELPERS ──
  const M = 40; // margin
  const PW = doc.page.width - M * 2; // page content width
  const col = {
    subject: M + 20,
    coef: M + 220,
    average: M + 285,
    points: M + 360,
    mention: M + 435,
  };
  const colW = {
    subject: 190,
    coef: 55,
    average: 65,
    points: 65,
    mention: 75,
  };

  let currentY = 0;

  // ── BORDER FRAME ──
  roundedRect(doc, M - 5, M - 5, PW + 10, doc.page.height - 70, 12);
  doc.lineWidth(1.5).stroke(C.border);

  // ══════════════════════════════════════════════
  // SECTION 1: HEADER
  // ══════════════════════════════════════════════
  roundedRect(doc, M, M, PW, 120, 8);
  doc.fill(C.primary).fill();

  doc.fill(C.white);
  doc.fontSize(10).font('Helvetica');
  if (schoolAddress) {
    doc.text(schoolAddress, M + 20, M + 12, { align: 'left' });
  }
  if (schoolPhone) {
    doc.text(`Tel: ${schoolPhone}`, M + 20, schoolAddress ? M + 26 : M + 12);
  }
  if (schoolEmail) {
    const emailY = schoolPhone ? (schoolAddress ? M + 40 : M + 26) : (schoolAddress ? M + 26 : M + 12);
    doc.text(`Email: ${schoolEmail}`, M + 20, emailY);
  }

  doc.fontSize(22).font('Helvetica-Bold');
  doc.text(schoolName, M, M + 30, { align: 'center', width: PW });
  doc.moveDown(0.2);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('BULLETIN SCOLAIRE', M, M + 62, { align: 'center', width: PW });
  doc.fontSize(11).font('Helvetica');
  doc.text(`${trimesterNames[trimester] || trimester} Trimestre — Année ${schoolYear}`, M, M + 88, { align: 'center', width: PW });

  currentY = M + 135;

  // ══════════════════════════════════════════════
  // SECTION 2: STUDENT INFO
  // ══════════════════════════════════════════════
  roundedRect(doc, M, currentY, PW, 80, 8);
  doc.fill(C.surface).fill();

  doc.fill(C.text);
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Élève', M + 20, currentY + 12);
  doc.font('Helvetica').fontSize(10);
  doc.text(`${student.lastName} ${student.firstName}`, M + 20, currentY + 28);

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Classe', M + 220, currentY + 12);
  doc.font('Helvetica').fontSize(10);
  doc.text(className, M + 220, currentY + 28);

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Code', M + 380, currentY + 12);
  doc.font('Helvetica').fontSize(10);
  doc.text(student.studentCode || '-', M + 380, currentY + 28);

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Né(e) le', M + 20, currentY + 50);
  doc.font('Helvetica').fontSize(10);
  const birthDate = student.birthDate ? new Date(student.birthDate).toLocaleDateString('fr-FR') : '-';
  doc.text(birthDate, M + 20, currentY + 66);

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Genre', M + 220, currentY + 50);
  doc.font('Helvetica').fontSize(10);
  doc.text(student.gender === 'M' ? 'Masculin' : 'Féminin', M + 220, currentY + 66);

  if (student.parentName) {
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Parent', M + 380, currentY + 50);
    doc.font('Helvetica').fontSize(10);
    doc.text(student.parentName, M + 380, currentY + 66);
  }

  currentY += 95;

  // ══════════════════════════════════════════════
  // SECTION 3: GRADES TABLE
  // ══════════════════════════════════════════════
  const tableStartY = currentY;
  const rowHeight = 22;
  const headerHeight = 30;
  const tableWidth = PW - 40;
  const tableX = M + 20;

  // Table wrapper
  roundedRect(doc, tableX - 10, tableStartY - 5, tableWidth + 20, headerHeight + subjectRows.length * rowHeight + 30, 8);
  doc.lineWidth(1).stroke(C.border);

  // Table header row
  roundedRect(doc, tableX - 10, tableStartY - 5, tableWidth + 20, headerHeight, 8);
  doc.fill(C.headerBg).fill();

  doc.fill(C.white);
  doc.fontSize(9).font('Helvetica-Bold');
  const hdrY = tableStartY + 8;
  doc.text('MATIÈRE', col.subject, hdrY, { width: colW.subject });
  doc.text('COEF', col.coef, hdrY, { width: colW.coef, align: 'center' });
  doc.text('MOYENNE', col.average, hdrY, { width: colW.average, align: 'center' });
  doc.text('POINTS', col.points, hdrY, { width: colW.points, align: 'center' });
  doc.text('MENTION', col.mention, hdrY, { width: colW.mention, align: 'center' });

  currentY = tableStartY + headerHeight;
  doc.fontSize(9).font('Helvetica');

  for (let i = 0; i < subjectRows.length; i++) {
    const row = subjectRows[i];
    const rowY = currentY + i * rowHeight;
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.fillColor(C.rowEven);
      doc.rect(tableX - 10, rowY, tableWidth + 20, rowHeight).fill();
    }

    doc.fillColor(C.text);
    doc.text(row.subjectName, col.subject, rowY + 5, { width: colW.subject });

    doc.text(String(row.coefficient), col.coef, rowY + 5, { width: colW.coef, align: 'center' });

    const avgColor = row.average >= 12 ? C.success : row.average >= 10 ? C.warning : C.danger;
    doc.fillColor(avgColor);
    doc.font('Helvetica-Bold');
    doc.text(row.average.toFixed(2), col.average, rowY + 5, { width: colW.average, align: 'center' });
    doc.font('Helvetica');

    doc.fillColor(C.text);
    doc.text(row.weightedPoints.toFixed(2), col.points, rowY + 5, { width: colW.points, align: 'center' });

    const ment = row.mention;
    const mentX = col.mention + (colW.mention - 28) / 2;
    doc.fillColor(ment.color);
    doc.roundedRect(mentX, rowY + 3, 28, 16, 4);
    doc.fill();
    doc.fillColor(C.white);
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text(ment.label, mentX, rowY + 5, { width: 28, align: 'center' });
    doc.fontSize(9).font('Helvetica');
  }

  currentY += subjectRows.length * rowHeight + 10;

  // ── TOTAL ROW ──
  const totalRowY = currentY;
  doc.fillColor(C.primaryLight);
  doc.rect(tableX - 10, totalRowY, tableWidth + 20, 28).fill();

  doc.fillColor(C.primaryDark);
  doc.fontSize(10).font('Helvetica-Bold');
  const totalPoints = Math.round(totalWeightedSum * 100) / 100;
  doc.text(`Total des points : ${totalPoints.toFixed(2)}`, tableX + 5, totalRowY + 7);

  currentY += 45;

  // ══════════════════════════════════════════════
  // SECTION 4: SUMMARY
  // ══════════════════════════════════════════════
  roundedRect(doc, tableX - 10, currentY, tableWidth + 20, 95, 8);
  doc.lineWidth(1).stroke(C.border);
  doc.fill(C.surface).fill();

  const summaryX = tableX + 10;

  doc.fillColor(C.text);
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('RÉSULTATS', summaryX, currentY + 12);
  doc.moveDown(0.2);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Moyenne Générale :`, summaryX, currentY + 34);
  doc.font('Helvetica-Bold');
  const avgDisplay = overallAverage.toFixed(2);
  doc.text(`${avgDisplay} / 20`, summaryX + 120, currentY + 34);

  // Colored average badge
  const badgeColor = overallAverage >= 14 ? C.success : overallAverage >= 10 ? C.warning : C.danger;
  doc.fillColor(badgeColor);
  doc.roundedRect(summaryX + 190, currentY + 30, 70, 20, 10);
  doc.fill();
  doc.fillColor(C.white);
  doc.fontSize(8).font('Helvetica-Bold');
  doc.text(overallMention.toUpperCase(), summaryX + 190, currentY + 34, { width: 70, align: 'center' });
  doc.fontSize(10).font('Helvetica');

  doc.fillColor(C.text);
  doc.font('Helvetica').fontSize(10);
  doc.text(`Rang :`, summaryX, currentY + 56);
  doc.font('Helvetica-Bold');
  const rankSuffix = rank === 1 ? 'er' : 'ème';
  doc.text(`${rank}${rankSuffix} / ${totalStudents}`, summaryX + 60, currentY + 56);

  doc.font('Helvetica').fontSize(10);
  doc.text(`Mention :`, summaryX + 200, currentY + 56);
  doc.font('Helvetica-Bold');
  doc.fillColor(badgeColor);
  doc.text(overallMention, summaryX + 255, currentY + 56);

  doc.fillColor(C.text);
  doc.font('Helvetica').fontSize(10);
  doc.text(`Effectif : ${totalStudents} élèves`, summaryX, currentY + 76);

  currentY += 110;

  // ══════════════════════════════════════════════
  // SECTION 5: DECISION
  // ══════════════════════════════════════════════
  if (decision) {
    roundedRect(doc, tableX - 10, currentY, tableWidth + 20, 40, 8);
    doc.lineWidth(1.5).stroke(decision === 'FÉLICITATIONS' ? C.success : decision === 'TABLEAU D\'HONNEUR' ? C.primary : C.warning);
    doc.fill(decision === 'FÉLICITATIONS' ? '#ECFDF5' : decision === 'TABLEAU D\'HONNEUR' ? C.primaryLight : '#FFFBEB').fill();

    doc.fontSize(12).font('Helvetica-Bold');
    doc.fillColor(decision === 'FÉLICITATIONS' ? C.success : decision === 'TABLEAU D\'HONNEUR' ? C.primary : C.warning);
    doc.text(`DÉCISION DU CONSEIL DE CLASSE : ${decision}`, summaryX, currentY + 12);
    currentY += 50;
  }

  // ══════════════════════════════════════════════
  // SECTION 6: APPRECIATION
  // ══════════════════════════════════════════════
  roundedRect(doc, tableX - 10, currentY, tableWidth + 20, 65, 8);
  doc.lineWidth(1).stroke(C.border);
  doc.fill(C.white).fill();

  doc.fillColor(C.text);
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('APPRÉCIATIONS DU CONSEIL DE CLASSE', summaryX, currentY + 12);

  doc.font('Helvetica').fontSize(9);
  doc.text('_________________________________________________________________________________', summaryX, currentY + 30);
  doc.text('_________________________________________________________________________________', summaryX, currentY + 44);

  currentY += 80;

  // ══════════════════════════════════════════════
  // SECTION 7: SIGNATURES
  // ══════════════════════════════════════════════
  const sigY = currentY;
  const sigColWidth = (tableWidth + 20) / 3;

  doc.moveTo(tableX - 10, sigY).lineTo(tableX - 10 + tableWidth + 20, sigY).stroke(C.border);

  doc.fontSize(9).font('Helvetica');
  doc.fillColor(C.text);
  doc.text('L\'Enseignant(e)', tableX - 10, sigY + 10, { width: sigColWidth, align: 'center' });
  doc.text('Le Directeur / La Directrice', tableX - 10 + sigColWidth, sigY + 10, { width: sigColWidth, align: 'center' });
  doc.text('Le Parent / Tuteur', tableX - 10 + sigColWidth * 2, sigY + 10, { width: sigColWidth, align: 'center' });

  doc.moveDown(1.5);
  doc.fontSize(9).font('Helvetica');
  doc.text('Signature : _______________________', tableX - 10, sigY + 30, { width: sigColWidth, align: 'center' });
  doc.text('Signature : _______________________', tableX - 10 + sigColWidth, sigY + 30, { width: sigColWidth, align: 'center' });
  doc.text('Signature : _______________________', tableX - 10 + sigColWidth * 2, sigY + 30, { width: sigColWidth, align: 'center' });

  doc.text('Date : ___ / ___ / _______', tableX - 10, sigY + 50, { width: sigColWidth, align: 'center' });
  doc.text('Date : ___ / ___ / _______', tableX - 10 + sigColWidth, sigY + 50, { width: sigColWidth, align: 'center' });
  doc.text('Date : ___ / ___ / _______', tableX - 10 + sigColWidth * 2, sigY + 50, { width: sigColWidth, align: 'center' });

  currentY = sigY + 85;

  // ══════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════
  const footerY = doc.page.height - 55;
  doc.lineWidth(0.5);
  doc.moveTo(M, footerY).lineTo(M + PW, footerY).stroke(C.border);

  doc.fontSize(7).font('Helvetica');
  doc.fillColor(C.textLight);
  const footerParts = [];
  if (schoolName) footerParts.push(schoolName);
  if (schoolPhone) footerParts.push(`Tel: ${schoolPhone}`);
  if (schoolEmail) footerParts.push(`Email: ${schoolEmail}`);
  if (schoolAddress) footerParts.push(schoolAddress);
  doc.text(footerParts.join('  |  '), M, footerY + 8, { align: 'center', width: PW });

  // Page number
  doc.text(`Page 1 / 1 — Document généré le ${new Date().toLocaleDateString('fr-FR')}`, M, footerY + 20, { align: 'center', width: PW });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

async function generateHonorRoll(classId, trimester, schoolYear, topCount = 5) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  const classSnap = await db().collection('classes').doc(classId).get();
  const className = classSnap.exists ? classSnap.data().name || '' : '';

  const settingsSnap = await db().collection('settings').doc('global').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : {};
  const schoolName = settings.schoolName || 'Établissement Scolaire';
  const schoolPhone = settings.schoolPhone || '';
  const schoolEmail = settings.schoolEmail || '';
  const schoolAddress = settings.schoolAddress || '';

  const periodsSnap = await db().collection('periods')
    .where('schoolYear', '==', schoolYear)
    .where('trimester', '==', trimester)
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

  const studentAverages = [];
  for (const sDoc of studentsSnap.docs) {
    const sId = sDoc.id;
    const sData = sDoc.data();
    const gradesSnap = await db().collection('grades')
      .where('studentId', '==', sId)
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
    studentAverages.push({ studentId: sId, firstName: sData.firstName, lastName: sData.lastName, average: avg });
  }

  studentAverages.sort((a, b) => b.average - a.average);
  const topStudents = studentAverages.slice(0, topCount);

  const trimesterNames = { 1: 'Premier', 2: 'Deuxième', 3: 'Troisième' };
  const M = 40;
  const PW = doc.page.width - M * 2;

  // ── BORDER FRAME ──
  roundedRect(doc, M - 5, M - 5, PW + 10, doc.page.height - 70, 12);
  doc.lineWidth(1.5).stroke(C.border);

  // ── HEADER ──
  roundedRect(doc, M, M, PW, 100, 8);
  doc.fill(C.primary).fill();
  doc.fill(C.white);

  doc.fontSize(10).font('Helvetica');
  if (schoolAddress) doc.text(schoolAddress, M + 20, M + 12);
  if (schoolPhone) doc.text(`Tel: ${schoolPhone}`, M + 20, schoolAddress ? M + 26 : M + 12);

  doc.fontSize(20).font('Helvetica-Bold');
  doc.text(schoolName, M, M + 25, { align: 'center', width: PW });
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('TABLEAU D\'HONNEUR', M, M + 58, { align: 'center', width: PW });
  doc.fontSize(10).font('Helvetica');
  doc.text(`${trimesterNames[trimester] || trimester} Trimestre — Année ${schoolYear}  |  Classe : ${className}`, M, M + 80, { align: 'center', width: PW });

  let currentY = M + 115;

  // ── TABLE ──
  const tableX = M + 20;
  const tableWidth = PW - 40;

  // Header bar
  doc.fillColor(C.headerBg);
  doc.roundedRect(tableX, currentY, tableWidth, 30, 6);
  doc.fill();
  doc.fillColor(C.white);
  doc.fontSize(10).font('Helvetica-Bold');
  const rankCol = tableX + 15;
  const nameCol = tableX + 80;
  const avgCol = tableX + tableWidth - 100;
  doc.text('RANG', rankCol, currentY + 8);
  doc.text('NOM ET PRÉNOM(S)', nameCol, currentY + 8);
  doc.text('MOYENNE', avgCol, currentY + 8, { width: 80, align: 'center' });

  currentY += 30;

  // Top students
  doc.fontSize(10).font('Helvetica');
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  for (let i = 0; i < topStudents.length; i++) {
    const s = topStudents[i];
    const rowY = currentY + i * 26;
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.fillColor(C.rowEven);
      doc.rect(tableX, rowY, tableWidth, 26).fill();
    }

    doc.fillColor(C.text);
    const rankLabel = `${i + 1}${i === 0 ? 'er' : 'ème'}`;
    doc.text(rankLabel, rankCol, rowY + 6);

    // Gold/Silver/Bronze circle for top 3
    if (i < 3) {
      doc.fillColor(medalColors[i]);
      doc.circle(tableX + 45, rowY + 13, 8);
      doc.fill();
      doc.fillColor(C.white);
      doc.fontSize(7).font('Helvetica-Bold');
      doc.text(`${i + 1}`, tableX + 45, rowY + 8, { width: 14, align: 'center' });
      doc.fontSize(10).font('Helvetica');
      doc.fillColor(C.text);
    }

    doc.text(`${s.lastName} ${s.firstName}`, nameCol, rowY + 6);
    doc.fillColor(s.average >= 14 ? C.success : s.average >= 10 ? C.warning : C.danger);
    doc.font('Helvetica-Bold');
    doc.text(s.average.toFixed(2), avgCol, rowY + 6, { width: 80, align: 'center' });
    doc.font('Helvetica');
    doc.fillColor(C.text);
  }

  currentY += topStudents.length * 26 + 30;

  // ── FOOTER ──
  const footerY = doc.page.height - 55;
  doc.lineWidth(0.5);
  doc.moveTo(M, footerY).lineTo(M + PW, footerY).stroke(C.border);
  doc.fontSize(7).font('Helvetica');
  doc.fillColor(C.textLight);
  const footerParts = [schoolName];
  if (schoolPhone) footerParts.push(`Tel: ${schoolPhone}`);
  if (schoolEmail) footerParts.push(`Email: ${schoolEmail}`);
  doc.text(footerParts.join('  |  '), M, footerY + 8, { align: 'center', width: PW });
  doc.text(`Page 1 / 1 — Document généré le ${new Date().toLocaleDateString('fr-FR')}`, M, footerY + 20, { align: 'center', width: PW });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

module.exports = { generateReportCard, generateHonorRoll };
