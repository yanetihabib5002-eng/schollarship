const { z } = require('zod');

const createPeriodSchema = z.object({
  schoolYear: z.string().min(1, 'Année scolaire requise'),
  month: z.number().int().min(1).max(12),
  monthName: z.string().min(1),
  trimester: z.number().int().min(1).max(3),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

module.exports = { createPeriodSchema };
