import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { updateProfileSchema } from '../validators/profileSchemas.js';
import { getActiveProfile, updateProfile as saveProfile } from '../models/profileModel.js';
import { removeUnusedImages } from '../services/imageCleanupService.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const data = parse(updateProfileSchema, req.body);

  const profile = await getActiveProfile();
  if (!profile) {
    throw new HttpError(404, 'Doctor profile not found. Load database/seed.sql first.');
  }

  await saveProfile(profile.id, data);
  const updated = await getActiveProfile();

  // If the profile photo was replaced or cleared, remove the old one when unused.
  let imagesRemoved = 0;
  if (profile.profile_image_url && profile.profile_image_url !== updated.profile_image_url) {
    imagesRemoved = await removeUnusedImages([profile.profile_image_url]);
  }

  res.json({ success: true, data: updated, meta: { images_removed: imagesRemoved } });
});