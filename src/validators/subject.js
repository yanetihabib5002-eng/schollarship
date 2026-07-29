const { z } = require('zod');

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  code: z.string().min(1, 'Code requis').max(20),
  defaultCoefficient: z.number().int().min(1, 'Coefficient >= 1'),
  stream: z.enum(['general_francophone', 'anglophone', 'technique', 'all'], 'Filière invalide'),
});

const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  defaultCoefficient: z.number().int().min(1).optional(),
  stream: z.enum(['general_francophone', 'anglophone', 'technique', 'all']).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Au moins un champ requis' });

module.exports = { createSubjectSchema, updateSubjectSchema };
