const { Router } = require('express');
const authService = require('../services/authService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginSchema, refreshSchema, changePasswordSchema, forgotPasswordSchema } = require('../validators/auth');
const { createAuditLog } = require('../utils/audit');

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentification]
 *     summary: Connexion admin (email) ou enseignant (matricule)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: admin@ecole.com
 *               password:
 *                 type: string
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiant ou mot de passe incorrect
 *       403:
 *         description: Compte désactivé
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.identifier, req.body.password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentification]
 *     summary: Rafraîchir le token d'accès
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token rafraîchi
 *       401:
 *         description: Refresh token invalide
 */
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentification]
 *     summary: Déconnexion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', authenticate, validate(refreshSchema), async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await authService.logout(token, req.body.refreshToken);
    await createAuditLog({
      action: 'LOGOUT',
      actorId: req.user.id,
      actorRole: req.user.role,
      targetType: 'user',
      targetId: req.user.id,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags: [Authentification]
 *     summary: Changer le mot de passe (enseignant)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       401:
 *         description: Ancien mot de passe incorrect
 */
router.put('/change-password', authenticate, requireRole('teacher'), validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.identifier);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
