const { Router } = require('express');
const teacherService = require('../services/teacherService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createTeacherSchema, updateTeacherSchema } = require('../validators/teacher');

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * /api/v1/teachers:
 *   get:
 *     tags: [Enseignants]
 *     summary: Lister les enseignants (admin)
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
 *         description: Recherche par nom, prénom, matricule, email
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: lastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Liste des enseignants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit (admin requis)
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await teacherService.listTeachers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/teachers:
 *   post:
 *     tags: [Enseignants]
 *     summary: Créer un enseignant (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enseignant créé (matricule + mot de passe temporaire dans la réponse)
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/', validate(createTeacherSchema), async (req, res, next) => {
  try {
    const teacher = await teacherService.createTeacher(req.body);
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   get:
 *     tags: [Enseignants]
 *     summary: Détail d'un enseignant (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détail de l'enseignant
 *       404:
 *         description: Enseignant introuvable
 */
router.get('/:id', async (req, res, next) => {
  try {
    const teacher = await teacherService.getTeacher(req.params.id);
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   put:
 *     tags: [Enseignants]
 *     summary: Modifier un enseignant (admin)
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
 *               email: { type: string }
 *               phone: { type: string }
 *               specialty: { type: string }
 *     responses:
 *       200:
 *         description: Enseignant mis à jour
 *       404:
 *         description: Enseignant introuvable
 */
router.put('/:id', validate(updateTeacherSchema), async (req, res, next) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body);
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   delete:
 *     tags: [Enseignants]
 *     summary: Supprimer un enseignant (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enseignant supprimé (soft delete)
 *       404:
 *         description: Enseignant introuvable
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await teacherService.deleteTeacher(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/teachers/{id}/toggle-active:
 *   patch:
 *     tags: [Enseignants]
 *     summary: Activer/Désactiver un enseignant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Statut modifié
 *       404:
 *         description: Enseignant introuvable
 */
router.patch('/:id/toggle-active', async (req, res, next) => {
  try {
    const result = await teacherService.toggleActive(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
