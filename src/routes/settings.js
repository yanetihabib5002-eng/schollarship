const { Router } = require('express');
const settingsService = require('../services/settingsService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const data = await settingsService.get();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/', async (req, res, next) => {
  try {
    const data = await settingsService.update(req.body, req.user?.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
});

module.exports = router;
