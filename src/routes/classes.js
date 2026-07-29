const { Router } = require('express');
const classService = require('../services/classService');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createClassSchema, updateClassSchema } = require('../validators/class');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const classes = await classService.listClasses(req.query);
    res.status(200).json({ success: true, data: classes });
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const cls = await classService.getClass(req.params.id);
    res.status(200).json({ success: true, data: cls });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireRole('admin'), validate(createClassSchema), async (req, res, next) => {
  try {
    const cls = await classService.createClass(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, requireRole('admin'), validate(updateClassSchema), async (req, res, next) => {
  try {
    const cls = await classService.updateClass(req.params.id, req.body);
    res.status(200).json({ success: true, data: cls });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await classService.deleteClass(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
