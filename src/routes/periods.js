const { Router } = require('express');
const periodService = require('../services/periodService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createPeriodSchema } = require('../validators/period');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await periodService.listPeriods(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireRole('admin'), validate(createPeriodSchema), async (req, res, next) => {
  try {
    const result = await periodService.createPeriod(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.patch('/:id/toggle-open', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await periodService.toggleOpen(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.patch('/:id/validate', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await periodService.validatePeriod(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
