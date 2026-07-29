const { Router } = require('express');
const gradeService = require('../services/gradeService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { batchGradeSchema, validateBatchSchema } = require('../validators/grade');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await gradeService.listGrades(req.query, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.put('/batch', authenticate, validate(batchGradeSchema), async (req, res, next) => {
  try {
    const result = await gradeService.batchUpsertGrades(req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.patch('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const result = await gradeService.submitGrade(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/validate-batch', authenticate, requireRole('admin'), validate(validateBatchSchema), async (req, res, next) => {
  try {
    const result = await gradeService.validateBatch(req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.patch('/:id/reopen', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await gradeService.reopenGrade(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.patch('/:id/validate', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await gradeService.validateGrade(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
