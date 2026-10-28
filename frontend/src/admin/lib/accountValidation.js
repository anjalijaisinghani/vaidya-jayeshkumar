// Rules for the admin's own account (name, email, password). They match the server's rules.
import { looksLikeEmail } from './profileValidation.js'

export const NAME_MAX = 100
export const EMAIL_MAX = 255
export const PASSWORD_MIN = 12
export const PASSWORD_MAX_BYTES = 72 // the password scrambling method (bcrypt) ignores anything beyond this

export const byteLength = (text) => new TextEncoder().encode(text).length

// The checklist shown under the new-password box. Each item says whether it is met right now.
export function passwordRules(current, next, confirm) {
  return [
    { id: 'length', text: `At least ${PASSWORD_MIN} characters`, met: next.length >= PASSWORD_MIN },
    {
      id: 'max',
      text: `Not longer than ${PASSWORD_MAX_BYTES} characters (accented letters and symbols count as more than one)`,
      met: byteLength(next) <= PASSWORD_MAX_BYTES,
    },
    { id: 'different', text: 'Different from your current password', met: next !== '' && next !== current },
    { id: 'match', text: 'Typed the same way in both boxes', met: confirm !== '' && next === confirm },
  ]
}

// Returns { field: message } for the details form. `name` and `email` are already tidied.
export function validateDetails({ name, email, emailChanged, currentPassword }) {
  const errors = {}
  if (!name) errors.name = 'Enter your name.'
  else if (name.length > NAME_MAX) errors.name = `The name must be ${NAME_MAX} characters or fewer.`

  if (!email) errors.email = 'Enter your email address.'
  else if (email.length > EMAIL_MAX || !looksLikeEmail(email)) {
    errors.email = 'Enter a valid email address, like name@example.com.'
  }

  if (emailChanged && !currentPassword) {
    errors.currentPassword = 'Enter your current password to change your email.'
  }
  return errors
}

// Returns { field: message } for the password form.
export function validatePasswordChange({ current, next, confirm }) {
  const errors = {}
  if (!current) errors.current = 'Enter your current password.'
  const unmet = passwordRules(current, next, confirm).find((rule) => !rule.met)
  if (unmet) errors.next = `Your new password is not ready yet: ${unmet.text.toLowerCase()}.`
  return errors
}