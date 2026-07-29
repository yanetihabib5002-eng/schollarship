const bcrypt = require('bcryptjs');
const env = require('./src/config/env');
const { db: getDb, connect } = require('./src/config/database');

let db;

async function seed() {
  console.log('[SEED] Début...');
  await connect();
  db = getDb();
  console.log('[SEED] Base connectée');
  const SALT_ROUNDS = 12;

  // ── 1. Admin ──
  const adminHash = await bcrypt.hash(env.admin.password, SALT_ROUNDS);
  const adminRef = db.collection('users').doc('admin');

  await adminRef.set({
    id: 'admin',
    email: env.admin.email,
    passwordHash: adminHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });
  console.log(`[SEED] Admin créé : ${env.admin.email} / ${env.admin.password}`);

  // ── 2. Settings ──
  await db.collection('settings').doc('global').set({
    id: 'global',
    currentSchoolYear: '2026-2027',
    schoolName: 'École Saint-Michel',
    schoolLogoUrl: '',
    address: 'Yaoundé, Cameroun',
    phone: '+237 600 00 00 00',
    email: 'contact@ecole.cm',
    trimesterWeights: { t1: 1, t2: 1, t3: 1 },
    gradeEntryOpen: false,
    updatedAt: new Date().toISOString(),
  });
  console.log('[SEED] Paramètres globaux créés');

  // ── 3. Classes (selon cahier des charges) ──
  const classes = [
    { name: '6e', level: '6e', stream: 'general_francophone', fullName: '6e - Général Francophone', order: 1 },
    { name: '5e', level: '5e', stream: 'general_francophone', fullName: '5e - Général Francophone', order: 2 },
    { name: '4e', level: '4e', stream: 'general_francophone', fullName: '4e - Général Francophone', order: 3 },
    { name: '3e', level: '3e', stream: 'general_francophone', fullName: '3e - Général Francophone', order: 4 },
    { name: '2nde A', level: '2nde A', stream: 'general_francophone', fullName: '2nde A - Général Francophone', order: 5 },
    { name: '2nde C', level: '2nde C', stream: 'general_francophone', fullName: '2nde C - Général Francophone', order: 6 },
    { name: '1ère A', level: '1ère A', stream: 'general_francophone', fullName: '1ère A - Général Francophone', order: 7 },
    { name: '1ère C', level: '1ère C', stream: 'general_francophone', fullName: '1ère C - Général Francophone', order: 8 },
    { name: '1ère D', level: '1ère D', stream: 'general_francophone', fullName: '1ère D - Général Francophone', order: 9 },
    { name: 'Tle A', level: 'Tle A', stream: 'general_francophone', fullName: 'Tle A - Général Francophone', order: 10 },
    { name: 'Tle C', level: 'Tle C', stream: 'general_francophone', fullName: 'Tle C - Général Francophone', order: 11 },
    { name: 'Tle D', level: 'Tle D', stream: 'general_francophone', fullName: 'Tle D - Général Francophone', order: 12 },
    { name: 'Form 1', level: 'Form 1', stream: 'anglophone', fullName: 'Form 1 - Anglophone', order: 13 },
    { name: 'Form 2', level: 'Form 2', stream: 'anglophone', fullName: 'Form 2 - Anglophone', order: 14 },
    { name: 'Form 3', level: 'Form 3', stream: 'anglophone', fullName: 'Form 3 - Anglophone', order: 15 },
    { name: 'Form 4', level: 'Form 4', stream: 'anglophone', fullName: 'Form 4 - Anglophone', order: 16 },
    { name: 'Form 5', level: 'Form 5', stream: 'anglophone', fullName: 'Form 5 - Anglophone', order: 17 },
  ];

  for (const cls of classes) {
    const ref = db.collection('classes').doc();
    await ref.set({ ...cls, id: ref.id, createdAt: new Date().toISOString(), deletedAt: null });
  }
  console.log(`[SEED] ${classes.length} classes créées`);

  // ── 4. Matières génériques ──
  const subjects = [
    { name: 'Mathématiques', code: 'MATH', defaultCoefficient: 4, stream: 'general_francophone' },
    { name: 'Français', code: 'FR', defaultCoefficient: 3, stream: 'general_francophone' },
    { name: 'Anglais', code: 'ANG', defaultCoefficient: 3, stream: 'general_francophone' },
    { name: 'Histoire-Géo', code: 'HG', defaultCoefficient: 2, stream: 'general_francophone' },
    { name: 'SVT', code: 'SVT', defaultCoefficient: 2, stream: 'general_francophone' },
    { name: 'Physique-Chimie', code: 'PC', defaultCoefficient: 3, stream: 'general_francophone' },
    { name: 'Philosophie', code: 'PHILO', defaultCoefficient: 2, stream: 'general_francophone' },
    { name: 'EPS', code: 'EPS', defaultCoefficient: 1, stream: 'general_francophone' },
    { name: 'English', code: 'ENG', defaultCoefficient: 4, stream: 'anglophone' },
    { name: 'Mathematics', code: 'MATH-ENG', defaultCoefficient: 4, stream: 'anglophone' },
    { name: 'Science', code: 'SCI', defaultCoefficient: 3, stream: 'anglophone' },
    { name: 'French', code: 'FR-ENG', defaultCoefficient: 2, stream: 'anglophone' },
  ];

  for (const subj of subjects) {
    const ref = db.collection('subjects').doc();
    await ref.set({ ...subj, id: ref.id, createdAt: new Date().toISOString(), deletedAt: null });
  }
  console.log(`[SEED] ${subjects.length} matières créées`);

  // ── 5. Périodes de l'année 2026-2027 ──
  const months = [
    { month: 9, name: 'Septembre', trimester: 1, start: '2026-09-01', end: '2026-09-30' },
    { month: 10, name: 'Octobre', trimester: 1, start: '2026-10-01', end: '2026-10-31' },
    { month: 11, name: 'Novembre', trimester: 1, start: '2026-11-01', end: '2026-11-30' },
    { month: 12, name: 'Décembre', trimester: 1, start: '2026-12-01', end: '2026-12-31' },
    { month: 1, name: 'Janvier', trimester: 2, start: '2027-01-01', end: '2027-01-31' },
    { month: 2, name: 'Février', trimester: 2, start: '2027-02-01', end: '2027-02-28' },
    { month: 3, name: 'Mars', trimester: 2, start: '2027-03-01', end: '2027-03-31' },
    { month: 4, name: 'Avril', trimester: 3, start: '2027-04-01', end: '2027-04-30' },
    { month: 5, name: 'Mai', trimester: 3, start: '2027-05-01', end: '2027-05-31' },
    { month: 6, name: 'Juin', trimester: 3, start: '2027-06-01', end: '2027-06-30' },
  ];

  for (const m of months) {
    const ref = db.collection('periods').doc();
    await ref.set({
      id: ref.id,
      schoolYear: '2026-2027',
      month: m.month,
      monthName: m.name,
      trimester: m.trimester,
      isOpenForGrades: false,
      isValidated: false,
      startDate: m.start,
      endDate: m.end,
      createdAt: new Date().toISOString(),
    });
  }
  console.log(`[SEED] ${months.length} périodes créées`);

  console.log('[SEED] ✅ Terminé avec succès !');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED] ❌ Erreur :', err);
  process.exit(1);
});
