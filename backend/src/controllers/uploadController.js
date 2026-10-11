import { fileTypeFromBuffer } from 'file-type';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { imageUploadsConfigured, uploadImageBuffer } from '../services/imageService.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadImage = asyncHandler(async (req, res) => {
  if (!imageUploadsConfigured) {
    throw new HttpError(503, 'Image uploads are not configured on the server');
  }
  if (!req.file) {
    throw new HttpError(400, 'No image received. Send the file in a form field named "image".');
  }

  // Check the real file content, not the filename or the type the browser claims.
  const detected = await fileTypeFromBuffer(req.file.buffer);
  if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
    throw new HttpError(415, 'Only JPG, PNG and WebP images are allowed');
  }

  let result;
  try {
    result = await uploadImageBuffer(req.file.buffer);
  } catch (err) {
    console.error('Cloudinary upload failed:', err.http_code || '', err.message);
    throw new HttpError(502, 'Image upload failed. Please try again.');
  }

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    },
  });
});