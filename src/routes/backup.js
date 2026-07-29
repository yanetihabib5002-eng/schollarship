const { Router } = require('express');
const backupService = require('../services/backupService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const result = await backupService.listBackups();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await backupService.createBackup();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/restore', async (req, res, next) => {
  try {
    const result = await backupService.restore(req.body.backupId);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/:backupId/download', async (req, res, next) => {
  try {
    const result = await backupService.downloadBackup(req.params.backupId);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
