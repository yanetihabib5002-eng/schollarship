const { Router } = require('express');
const reportCardService = require('../services/reportCardService');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const result = await reportCardService.list(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/generate', async (req, res, next) => {
  try {
    const result = await reportCardService.generate(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const pdf = await reportCardService.getPdf(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=bulletin-${req.params.id}.pdf`);
    res.send(pdf);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await reportCardService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
