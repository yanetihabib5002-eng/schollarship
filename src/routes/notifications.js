const { Router } = require('express');
const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const result = await notificationService.list(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await notificationService.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await notificationService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
