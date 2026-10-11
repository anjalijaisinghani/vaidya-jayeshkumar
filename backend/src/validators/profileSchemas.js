import { z } from 'zod';

const emptyToNull = (value) => (value === '' ? null : value);

// Optional text: an empty string clears the field (stored as NULL).
const text = (max) => z.string().trim().max(max).transform(emptyToNull).nullable().optional();

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isPhone(value) {
  if (!/^\+?[0-9 ()-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

const phone = z
  .string()
  .trim()
  .max(20)
  .refine((value) => value === '' || isPhone(value), 'Enter a valid phone number')
  .transform(emptyToNull)
  .nullable()
  .optional();

const email = z
  .string()
  .trim()
  .max(255)
  .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Enter a valid email address')
  .transform(emptyToNull)
  .nullable()
  .optional();

const httpsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === '' || isHttpsUrl(value), 'Must be a valid https:// link')
  .transform(emptyToNull)
  .nullable()
  .optional();

export const updateProfileSchema = z
  .object({
    doctor_name: z.string().trim().min(1).max(150).optional(),
    qualifications: text(5000),
    specialization: text(200),
    experience: text(100),
    about: text(10000),
    phone,
    whatsapp: phone,
    email,
    address: text(1000),
    timings: text(1000),
    map_url: httpsUrl,
    profile_image_url: httpsUrl,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });