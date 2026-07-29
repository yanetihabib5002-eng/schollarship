const { Router } = require('express');
const dashboardService = require('../services/dashboardService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/overview', async (req, res, next) => {
  try {
    const result = await dashboardService.getOverview();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/charts', async (req, res, next) => {
  try {
    const result = await dashboardService.getChartData();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/activities', async (req, res, next) => {
  try {
    const result = await dashboardService.getActivities();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/alerts', async (req, res, next) => {
  try {
    const result = await dashboardService.getAlerts();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/calendar', async (req, res, next) => {
  try {
    const result = await dashboardService.getCalendar();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
