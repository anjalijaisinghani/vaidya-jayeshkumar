import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { updateProfileSchema } from '../validators/profileSchemas.js';
import { getActiveProfile, updateProfile as saveProfile } from '../models/profileModel.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const data = parse(updateProfileSchema, req.body);

  const profile = await getActiveProfile();
  if (!profile) {
    throw new HttpError(404, 'Doctor profile not found. Load database/seed.sql first.');
  }

  await saveProfile(profile.id, data);
  res.json({ success: true, data: await getActiveProfile() });
});
