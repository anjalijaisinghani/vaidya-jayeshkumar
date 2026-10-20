export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

// Quick check in the browser so mistakes are caught before uploading.
// (The server checks the real file content again, so this is only for convenience.)
// Returns an error message, or '' if the file looks fine.
export function checkImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Please choose a JPG, PNG or WebP image.'
  if (file.size > MAX_BYTES) return 'That image is larger than 5 MB. Please choose a smaller one.'
  return ''
}

// Sends one image to the server and returns its web address.
// `request` is the function from useAdminRequest().
export async function uploadImage(request, file) {
  const body = new FormData()
  body.append('image', file)
  const res = await request('/admin/uploads', { method: 'POST', body })
  return res.data.url
}