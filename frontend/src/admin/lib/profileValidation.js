// The doctor's profile form: field names, tidy-up, checks and conversion for the server.
// The checks match the server's rules, so mistakes are caught before anything is sent.

export const PROFILE_FIELDS = [
  'doctorName', 'specialization', 'experience', 'imageUrl', 'qualifications', 'about',
  'phone', 'whatsapp', 'email', 'address', 'timings', 'mapUrl',
]

// Element ids, so the first problem can be focused. Listed in the order they appear on the page.
export const FIELD_IDS = {
  doctorName: 'profile-name',
  specialization: 'profile-specialization',
  experience: 'profile-experience',
  qualifications: 'profile-qualifications',
  about: 'profile-about',
  phone: 'profile-phone',
  whatsapp: 'profile-whatsapp',
  email: 'profile-email',
  address: 'profile-address',
  timings: 'profile-timings',
  mapUrl: 'profile-map',
}

export const LIMITS = {
  doctorName: 150,
  specialization: 200,
  experience: 100,
  qualifications: 5000,
  about: 10000,
  phone: 20,
  whatsapp: 20,
  email: 255,
  address: 1000,
  timings: 1000,
  mapUrl: 2048,
}

export function formFromProfile(profile) {
  return {
    doctorName: profile?.doctor_name ?? '',
    specialization: profile?.specialization ?? '',
    experience: profile?.experience ?? '',
    imageUrl: profile?.profile_image_url ?? '',
    qualifications: profile?.qualifications ?? '',
    about: profile?.about ?? '',
    phone: profile?.phone ?? '',
    whatsapp: profile?.whatsapp ?? '',
    email: profile?.email ?? '',
    address: profile?.address ?? '',
    timings: profile?.timings ?? '',
    mapUrl: profile?.map_url ?? '',
  }
}

// Same shape check used for browser backups of this form.
export const isProfileForm = (form) =>
  Boolean(form) && typeof form === 'object' && PROFILE_FIELDS.every((field) => typeof form[field] === 'string')

// Removes spaces around every value.
export const tidy = (form) => Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))

export function isValidPhone(value) {
  if (value === '') return true
  if (!/^\+?[0-9 ()-]+$/.test(value)) return false
  const digits = value.replace(/\D/g, '').length
  return digits >= 7 && digits <= 15
}

// The same rule the server uses (the Zod library's email check), so the form and the server agree.
export const looksLikeEmail = (value) =>
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/.test(value)

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const tooLong = (label, max) => `${label} must be ${max} characters or fewer.`

// form: already tidied. Returns { fieldName: message } (empty when everything is fine).
export function validateProfile(form) {
  const errors = {}

  if (!form.doctorName) errors.doctorName = 'Enter the doctor\u2019s name.'
  else if (form.doctorName.length > LIMITS.doctorName) errors.doctorName = tooLong('The name', LIMITS.doctorName)

  for (const [field, label] of [
    ['specialization', 'Specialization'],
    ['experience', 'Experience'],
    ['qualifications', 'Qualifications'],
    ['about', 'The introduction'],
    ['address', 'The address'],
    ['timings', 'The clinic timings'],
  ]) {
    if (form[field].length > LIMITS[field]) errors[field] = tooLong(label, LIMITS[field])
  }

  for (const [field, label] of [['phone', 'phone number'], ['whatsapp', 'WhatsApp number']]) {
    const value = form[field]
    if (value.length > LIMITS[field]) errors[field] = `Use at most ${LIMITS[field]} characters for the ${label}.`
    else if (!/^\+?[0-9 ()-]*$/.test(value)) errors[field] = `The ${label} may only contain digits, spaces, brackets, hyphens and a leading +.`
    else if (!isValidPhone(value)) errors[field] = `A ${label} needs 7 to 15 digits.`
  }

  if (form.email && (form.email.length > LIMITS.email || !looksLikeEmail(form.email))) {
    errors.email = 'Enter a valid email address, like name@example.com.'
  }

  if (form.mapUrl && (form.mapUrl.length > LIMITS.mapUrl || !isHttpsUrl(form.mapUrl))) {
    errors.mapUrl = 'The map link must be a web address starting with https://'
  }

  return errors
}

// An empty value is sent as '' and the server stores it as "not set".
export function toPayload(form) {
  return {
    doctor_name: form.doctorName,
    specialization: form.specialization,
    experience: form.experience,
    qualifications: form.qualifications,
    about: form.about,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    address: form.address,
    timings: form.timings,
    map_url: form.mapUrl,
    profile_image_url: form.imageUrl,
  }
}

// The database starts with placeholder wording; the doctor should replace it before launch.
export const hasPlaceholder = (form) => Object.values(form).some((value) => /\bPLACEHOLDER\b/.test(value))