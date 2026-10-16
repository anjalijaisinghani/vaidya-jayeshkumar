// Turns the contact details typed by the doctor into links that work on phones.

// "+91 98765-43210" -> "tel:+919876543210"
export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`
}

// WhatsApp links need the number in international form, digits only.
//   "+91 98765 43210" -> https://wa.me/919876543210
//   "98765 43210" (10 digits, no country code) is treated as an Indian number.
export function whatsappHref(number) {
  const raw = String(number).trim()
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (!raw.startsWith('+') && digits.length === 10) digits = `91${digits}`
  return `https://wa.me/${digits}`
}

export function mailtoHref(email) {
  return `mailto:${String(email).trim()}`
}