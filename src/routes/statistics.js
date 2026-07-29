const { Router } = require('express');
const statisticsService = require('../services/statisticsService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/overview', async (req, res, next) => {
  try {
    const result = await statisticsService.getOverview();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/class/:classId/trimester/:trimester', async (req, res, next) => {
  try {
    const result = await statisticsService.getClassTrimesterStats(req.params.classId, req.params.trimester);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
