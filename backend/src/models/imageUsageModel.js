import { pool } from '../config/database.js';
import { escapeLike } from '../utils/sql.js';

// True if any post (draft or published) or the doctor profile still uses this image.
export async function isPublicIdReferenced(publicId) {
  const like = `%${escapeLike(publicId)}%`;

  const [postRows] = await pool.query(
    'SELECT 1 FROM posts WHERE cover_image_url LIKE ? OR content LIKE ? LIMIT 1',
    [like, like]
  );
  if (postRows.length > 0) return true;

  const [profileRows] = await pool.query(
    'SELECT 1 FROM doctor_profile WHERE profile_image_url LIKE ? LIMIT 1',
    [like]
  );
  return profileRows.length > 0;
}