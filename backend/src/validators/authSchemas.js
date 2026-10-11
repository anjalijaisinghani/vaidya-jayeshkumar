import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email().max(255);

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const newPasswordField = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .refine((value) => Buffer.byteLength(value) <= 72, 'Password is too long (72 bytes maximum)');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(200),
});

export const updateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: emailField.optional(),
    currentPassword: z.string().min(1).max(200).optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide a name or an email to update',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: newPasswordField,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });