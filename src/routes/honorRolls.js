const { Router } = require('express');
const honorRollService = require('../services/honorRollService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const result = await honorRollService.list(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/generate', async (req, res, next) => {
  try {
    const result = await honorRollService.generate(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const pdf = await honorRollService.getPdf(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=tableau-honneur-${req.params.id}.pdf`);
    res.send(pdf);
  } catch (error) { next(error); }
});

module.exports = router;
