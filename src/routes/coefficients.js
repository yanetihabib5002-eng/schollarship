const { Router } = require('express');
const coefficientService = require('../services/coefficientService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createCoefficientSchema } = require('../validators/coefficient');

const router = Router();
router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * /api/v1/coefficients:
 *   get:
 *     tags: [Coefficients]
 *     summary: Lister les coefficients spécifiques (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *       - in: query
 *         name: subjectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des coefficients
 *       401:
 *         description: Non authentifié
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await coefficientService.listCoefficients(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/coefficients:
 *   post:
 *     tags: [Coefficients]
 *     summary: Définir un coefficient spécifique (admin)
 *     description: Écrase le coefficient par défaut pour (classe, matière)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classId, subjectId, coefficient]
 *             properties:
 *               classId: { type: string }
 *               subjectId: { type: string }
 *               coefficient: { type: integer }
 *     responses:
 *       200:
 *         description: Coefficient créé ou mis à jour
 *       404:
 *         description: Classe ou matière introuvable
 */
router.post('/', validate(createCoefficientSchema), async (req, res, next) => {
  try {
    const result = await coefficientService.setCoefficient(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/coefficients/{id}:
 *   delete:
 *     tags: [Coefficients]
 *     summary: Supprimer un coefficient spécifique (admin)
 *     description: La matière reprend son coefficient par défaut
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coefficient supprimé
 *       404:
 *         description: Coefficient introuvable
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await coefficientService.deleteCoefficient(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
