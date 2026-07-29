const { Router } = require('express');
const assignmentService = require('../services/assignmentService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createAssignmentSchema } = require('../validators/assignment');

const router = Router();
router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * /api/v1/assignments:
 *   get:
 *     tags: [Affectations]
 *     summary: Lister les affectations (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema: { type: string }
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *       - in: query
 *         name: subjectId
 *         schema: { type: string }
 *       - in: query
 *         name: schoolYear
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Liste des affectations
 *       401:
 *         description: Non authentifié
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await assignmentService.listAssignments(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   get:
 *     tags: [Affectations]
 *     summary: Détail d'une affectation (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détail
 *       404:
 *         description: Affectation introuvable
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await assignmentService.getAssignment(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/assignments:
 *   post:
 *     tags: [Affectations]
 *     summary: Créer une affectation (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [teacherId, classId, subjectId, schoolYear]
 *             properties:
 *               teacherId: { type: string }
 *               classId: { type: string }
 *               subjectId: { type: string }
 *               schoolYear: { type: string }
 *     responses:
 *       201:
 *         description: Affectation créée
 *       404:
 *         description: Enseignant, classe ou matière introuvable
 *       409:
 *         description: Doublon d'affectation
 */
router.post('/', validate(createAssignmentSchema), async (req, res, next) => {
  try {
    const result = await assignmentService.createAssignment(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/batch', async (req, res, next) => {
  try {
    const result = await assignmentService.createMultipleAssignments(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   delete:
 *     tags: [Affectations]
 *     summary: Supprimer une affectation (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Affectation supprimée
 *       404:
 *         description: Affectation introuvable
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await assignmentService.deleteAssignment(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
