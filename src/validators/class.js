const { z } = require('zod');

const createClassSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(50),
  level: z.string().min(1, 'Niveau requis').max(50),
  stream: z.enum(['general_francophone', 'anglophone', 'technique'], 'Filière invalide'),
  fullName: z.string().min(1, 'Nom complet requis').max(100),
  order: z.number().int().min(1, 'Ordre requis'),
});

const updateClassSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  level: z.string().min(1).max(50).optional(),
  stream: z.enum(['general_francophone', 'anglophone', 'technique']).optional(),
  fullName: z.string().min(1).max(100).optional(),
  order: z.number().int().min(1).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Au moins un champ requis' });

module.exports = { createClassSchema, updateClassSchema };
