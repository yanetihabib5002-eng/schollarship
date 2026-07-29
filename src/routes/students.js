const { Router } = require('express');
const studentService = require('../services/studentService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createStudentSchema, updateStudentSchema } = require('../validators/student');

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     tags: [Élèves]
 *     summary: Lister les élèves (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *       - in: query
 *         name: schoolYear
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: lastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Liste des élèves
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await studentService.listStudents(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     tags: [Élèves]
 *     summary: Créer un élève (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, birthDate, gender, classId, schoolYear]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               birthDate: { type: string, format: date }
 *               birthPlace: { type: string }
 *               gender: { type: string, enum: [M, F] }
 *               classId: { type: string }
 *               schoolYear: { type: string }
 *               parentName: { type: string }
 *               parentPhone: { type: string }
 *               parentEmail: { type: string }
 *               hasSmartphone: { type: boolean }
 *               isFirstYear: { type: boolean }
 *     responses:
 *       201:
 *         description: Élève créé
 *       404:
 *         description: Classe introuvable
 */
router.post('/', validate(createStudentSchema), async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     tags: [Élèves]
 *     summary: Détail d'un élève (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détail de l'élève
 *       404:
 *         description: Élève introuvable
 */
router.get('/:id', async (req, res, next) => {
  try {
    const student = await studentService.getStudent(req.params.id);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     tags: [Élèves]
 *     summary: Modifier un élève (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               birthDate: { type: string }
 *               classId: { type: string }
 *               schoolYear: { type: string }
 *               parentPhone: { type: string }
 *               hasSmartphone: { type: boolean }
 *     responses:
 *       200:
 *         description: Élève mis à jour
 *       404:
 *         description: Élève ou classe introuvable
 */
router.put('/:id', validate(updateStudentSchema), async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     tags: [Élèves]
 *     summary: Supprimer un élève (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Élève supprimé
 *       404:
 *         description: Élève introuvable
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
