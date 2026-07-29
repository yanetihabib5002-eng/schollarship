const { Router } = require('express');
const subjectService = require('../services/subjectService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createSubjectSchema, updateSubjectSchema } = require('../validators/subject');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const subjects = await subjectService.listSubjects(req.query);
    res.status(200).json({ success: true, data: subjects });
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const subject = await subjectService.getSubject(req.params.id);
    res.status(200).json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireRole('admin'), validate(createSubjectSchema), async (req, res, next) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, requireRole('admin'), validate(updateSubjectSchema), async (req, res, next) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    res.status(200).json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await subjectService.deleteSubject(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
