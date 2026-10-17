// After signing in we send the person back to the page they wanted. Only addresses inside
// /admin are accepted, so a crafted link can never redirect to another website.
export function safeAdminPath(value) {
  const ok =
    typeof value === 'string' &&
    (value === '/admin' || value.startsWith('/admin/') || value.startsWith('/admin?')) &&
    !value.includes('//') &&
    !value.includes('\\') &&
    !value.startsWith('/admin/login')
  return ok ? value : '/admin'
}