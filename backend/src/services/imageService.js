import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

export const imageUploadsConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (imageUploadsConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

// Sends an in-memory image to Cloudinary. The stored copy is limited to 1600 px
// and automatically compressed, which saves free-plan storage and bandwidth.
export function uploadImageBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        tags: ['vaidya-jayeshkumar'],
        transformation: [
          { width: 1600, height: 1600, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}