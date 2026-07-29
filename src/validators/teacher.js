const { z } = require('zod');

const createTeacherSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(100),
  lastName: z.string().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  specialty: z.string().optional().or(z.literal('')),
});

const updateTeacherSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  specialty: z.string().optional().or(z.literal('')),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni' }
);

module.exports = { createTeacherSchema, updateTeacherSchema };
