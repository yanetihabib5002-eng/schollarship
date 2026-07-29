const { Router } = require('express');
const authRoutes = require('./auth');
const teacherRoutes = require('./teachers');
const studentRoutes = require('./students');
const classRoutes = require('./classes');
const subjectRoutes = require('./subjects');
const coefficientRoutes = require('./coefficients');
const assignmentRoutes = require('./assignments');
const periodRoutes = require('./periods');
const gradeRoutes = require('./grades');
const teacherRoutesInternal = require('./teacher');
const reportCardRoutes = require('./reportCards');
const honorRollRoutes = require('./honorRolls');
const statisticsRoutes = require('./statistics');
const backupRoutes = require('./backup');
const dashboardRoutes = require('./dashboard');
const settingsRoutes = require('./settings');
const notificationRoutes = require('./notifications');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Authentification
 *     description: Connexion, déconnexion, rafraîchissement
 *   - name: Enseignants
 *     description: Gestion des enseignants (admin)
 *   - name: Élèves
 *     description: Gestion des élèves (admin)
 *   - name: Classes
 *     description: Gestion des classes
 *   - name: Matières
 *     description: Gestion des matières
 *   - name: Coefficients
 *     description: Coefficients spécifiques classe × matière
 *   - name: Affectations
 *     description: Lien enseignant → classe → matière
 *   - name: Périodes
 *     description: Gestion des périodes mensuelles
 *   - name: Notes
 *     description: Saisie et validation des notes
 *   - name: Enseignant (Dashboard)
 *     description: Tableau de bord enseignant
 *   - name: Bulletins
 *     description: Génération et consultation des bulletins PDF
 *   - name: Tableaux d'Honneur
 *     description: Génération des tableaux d'honneur PDF
 *   - name: Statistiques
 *     description: Indicateurs et rapports
 *   - name: Sauvegarde
 *     description: Sauvegarde et restauration des données
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/coefficients', coefficientRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/periods', periodRoutes);
router.use('/grades', gradeRoutes);
router.use('/teacher', teacherRoutesInternal);
router.use('/report-cards', reportCardRoutes);
router.use('/honor-rolls', honorRollRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/backup', backupRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Santé]
 *     summary: Vérification du serveur
 *     responses:
 *       200:
 *         description: Serveur opérationnel
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

module.exports = router;
