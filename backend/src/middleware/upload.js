import multer from 'multer';
import { HttpError } from '../utils/httpError.js';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 5 },
});

// Expects exactly one file in a form field named "image".
export function singleImage(req, res, next) {
  uploader.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new HttpError(413, 'Image is too large. Maximum size is 5 MB.'));
      }
      return next(new HttpError(400, `Upload error: ${err.message}`));
    }
    return next(err);
  });
}