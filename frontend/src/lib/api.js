// Small wrapper around fetch for the backend API.
// In development, Vite forwards /api/* to the Express server (see vite.config.js).

const BASE = '/api/v1'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Returns the parsed JSON body: { success, data, meta? }. Throws ApiError on any failure.
// `body` is sent as JSON, unless it is a FormData (a file upload), which is sent as it is.
export async function api(path, { method = 'GET', body, signal } = {}) {
  const options = { method, credentials: 'include', signal, headers: {} }
  if (body instanceof FormData) {
    options.body = body
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, options)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0)
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // The response was not JSON; handled below.
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.error?.message || `Request failed (${response.status})`, response.status)
  }
  return payload
}