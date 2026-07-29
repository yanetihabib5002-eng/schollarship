const { z } = require('zod');

const createStudentSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(100),
  lastName: z.string().min(1, 'Nom requis').max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format YYYY-MM-DD'),
  birthPlace: z.string().optional().or(z.literal('')),
  gender: z.enum(['M', 'F'], 'Genre invalide'),
  classId: z.string().min(1, 'Classe requise'),
  schoolYear: z.string().min(1, 'Année scolaire requise'),
  photoUrl: z.string().optional().or(z.literal('')),
  parentName: z.string().optional().or(z.literal('')),
  parentPhone: z.string().optional().or(z.literal('')),
  parentEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  hasSmartphone: z.boolean().optional().default(false),
  isFirstYear: z.boolean().optional().default(true),
});

const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format YYYY-MM-DD').optional(),
  birthPlace: z.string().optional().or(z.literal('')),
  gender: z.enum(['M', 'F']).optional(),
  classId: z.string().min(1).optional(),
  schoolYear: z.string().min(1).optional(),
  photoUrl: z.string().optional().or(z.literal('')),
  parentName: z.string().optional().or(z.literal('')),
  parentPhone: z.string().optional().or(z.literal('')),
  parentEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  hasSmartphone: z.boolean().optional(),
  isFirstYear: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Au moins un champ requis' });

module.exports = { createStudentSchema, updateStudentSchema };
