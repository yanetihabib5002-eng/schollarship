const { z } = require('zod');

const createCoefficientSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  coefficient: z.number().int().min(1, 'Coefficient >= 1'),
});

module.exports = { createCoefficientSchema };
