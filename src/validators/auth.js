const { z } = require('zod');

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Ancien mot de passe requis'),
  newPassword: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Identifiant requis'),
});

module.exports = { loginSchema, refreshSchema, changePasswordSchema, forgotPasswordSchema };
