const { z } = require('zod');

const batchGradeSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  periodId: z.string().min(1, 'Période requise'),
  grades: z.array(
    z.object({
      studentId: z.string().min(1),
      value: z.number().min(0, 'Note >= 0').max(20, 'Note <= 20'),
    })
  ).min(1, 'Au moins une note requise'),
});

const validateBatchSchema = z.object({
  periodId: z.string().min(1, 'Période requise'),
  classId: z.string().optional().or(z.literal('')),
  subjectId: z.string().optional().or(z.literal('')),
});

module.exports = { batchGradeSchema, validateBatchSchema };
