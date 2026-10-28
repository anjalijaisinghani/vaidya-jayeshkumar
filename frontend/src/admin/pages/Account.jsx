import { useState } from 'react'
import Seo from '../../components/Seo.jsx'
import { useAuth } from '../auth/useAuth.js'
import { useAdminRequest } from '../hooks/useAdminRequest.js'
import {
  EMAIL_MAX,
  NAME_MAX,
  passwordRules,
  validateDetails,
  validatePasswordChange,
} from '../lib/accountValidation.js'

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}

const describedBy = (id, { hint, error }) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

// ---------- Name and email ----------
function DetailsCard() {
  const { admin, updateAdmin } = useAuth()
  const request = useAdminRequest()

  const [name, setName] = useState(admin.name)
  const [email, setEmail] = useState(admin.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()
  const nameChanged = cleanName !== admin.name
  const emailChanged = cleanEmail !== admin.email.toLowerCase()
  const changed = nameChanged || emailChanged

  async function save() {
    const found = validateDetails({ name: cleanName, email: cleanEmail, emailChanged, currentPassword })
    setErrors(found)
    setServerError('')
    setNotice('')
    const first = ['name', 'email', 'currentPassword'].find((field) => found[field])
    if (first) {
      document.getElementById({ name: 'account-name', email: 'account-email', currentPassword: 'account-email-password' }[first])?.focus()
      return
    }

    const body = {}
    if (nameChanged) body.name = cleanName
    if (emailChanged) {
      body.email = cleanEmail
      body.currentPassword = currentPassword
    }

    setSaving(true)
    try {
      const res = await request('/admin/account', { method: 'PATCH', body })
      updateAdmin(res.data)
      setName(res.data.name)
      setEmail(res.data.email)
      setCurrentPassword('')
      setNotice(
        emailChanged
          ? `Your details were saved. Use ${res.data.email} the next time you sign in.`
          : 'Your details were saved.',
      )
    } catch (err) {
      if (err.status === 401) return
      if (err.status === 403) setErrors({ currentPassword: 'The current password is incorrect.' })
      else if (err.status === 409) setErrors({ email: err.message })
      else setServerError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card space-y-5 p-6" aria-labelledby="details-heading">
      <h2 id="details-heading" className="text-2xl">Your details</h2>
      <p className="text-sm text-ink-600">The email is what you type to sign in.</p>

      <div aria-live="polite">
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
      </div>
      {serverError && <p className="alert alert-error" role="alert">{serverError}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="account-name" label="Name" error={errors.name}>
          <input
            id="account-name"
            type="text"
            value={name}
            maxLength={NAME_MAX}
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            className={`field-input ${errors.name ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('account-name', { error: errors.name })}
          />
        </Field>
        <Field id="account-email" label="Email" error={errors.email}>
          <input
            id="account-email"
            type="email"
            value={email}
            maxLength={EMAIL_MAX}
            autoComplete="username"
            onChange={(event) => setEmail(event.target.value)}
            className={`field-input ${errors.email ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('account-email', { error: errors.email })}
          />
        </Field>
      </div>

      {emailChanged && (
        <Field
          id="account-email-password"
          label="Current password"
          hint="Needed to change your email, to make sure it is really you."
          error={errors.currentPassword}
        >
          <input
            id="account-email-password"
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={`field-input max-w-sm ${errors.currentPassword ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={describedBy('account-email-password', { hint: true, error: errors.currentPassword })}
          />
        </Field>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-primary" disabled={saving || !changed} onClick={save}>
          {saving ? 'Saving...' : 'Save details'}
        </button>
        {!changed && <p className="text-sm text-ink-600">Nothing to save yet.</p>}
      </div>
    </section>
  )
}

// ---------- Password ----------
function PasswordCard() {
  const request = useAdminRequest()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const type = show ? 'text' : 'password'
  const rules = passwordRules(current, next, confirm)

  async function save() {
    const found = validatePasswordChange({ current, next, confirm })
    setErrors(found)
    setServerError('')
    setNotice('')
    const first = ['current', 'next'].find((field) => found[field])
    if (first) {
      document.getElementById(first === 'current' ? 'password-current' : 'password-new')?.focus()
      return
    }

    setSaving(true)
    try {
      await request('/admin/account/password', { method: 'PATCH', body: { currentPassword: current, newPassword: next } })
      setCurrent('')
      setNext('')
      setConfirm('')
      setShow(false)
      setNotice('Your password was changed. Every other browser or device you were signed in on has been signed out.')
    } catch (err) {
      if (err.status === 401) return
      if (err.status === 403) {
        setErrors({ current: 'The current password is incorrect.' })
        document.getElementById('password-current')?.focus()
      } else {
        setServerError(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card space-y-5 p-6" aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-2xl">Change password</h2>
      <p className="text-sm text-ink-600">
        A long phrase that you can remember is better than a short complicated one. A password manager can keep it for you.
      </p>

      <div aria-live="polite">
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
      </div>
      {serverError && <p className="alert alert-error" role="alert">{serverError}</p>}

      <div className="max-w-md space-y-5">
        <Field id="password-current" label="Current password" error={errors.current}>
          <input
            id="password-current"
            type={type}
            value={current}
            autoComplete="current-password"
            onChange={(event) => setCurrent(event.target.value)}
            className={`field-input ${errors.current ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(errors.current)}
            aria-describedby={describedBy('password-current', { error: errors.current })}
          />
        </Field>

        <Field id="password-new" label="New password" error={errors.next}>
          <input
            id="password-new"
            type={type}
            value={next}
            autoComplete="new-password"
            onChange={(event) => setNext(event.target.value)}
            className={`field-input ${errors.next ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(errors.next)}
            aria-describedby={['password-rules', errors.next && 'password-new-error'].filter(Boolean).join(' ')}
          />
        </Field>

        <Field id="password-confirm" label="Type the new password again">
          <input
            id="password-confirm"
            type={type}
            value={confirm}
            autoComplete="new-password"
            onChange={(event) => setConfirm(event.target.value)}
            className="field-input"
          />
        </Field>

        <ul id="password-rules" className="space-y-1 text-sm" aria-label="Rules for the new password">
          {rules.map((rule) => (
            <li key={rule.id} className={rule.met ? 'text-leaf-800' : 'text-ink-600'}>
              <span aria-hidden="true">{rule.met ? '\u2713' : '\u25CB'}</span>{' '}
              <span className="sr-only">{rule.met ? 'Done: ' : 'Not yet: '}</span>
              {rule.text}
            </li>
          ))}
        </ul>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="size-4 accent-leaf-700" />
          Show the passwords while I type
        </label>
      </div>

      <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
        {saving ? 'Changing...' : 'Change password'}
      </button>
    </section>
  )
}

export default function Account() {
  return (
    <>
      <Seo title="Account" noindex />
      <h1 className="text-3xl">Account</h1>
      <p className="mt-2 text-ink-600">Your own sign-in details.</p>

      <div className="mt-8 space-y-8">
        <DetailsCard />
        <PasswordCard />
        <p className="text-sm text-ink-600">
          Forgotten your password? Ask the person who looks after the website&rsquo;s server to reset it for you.
        </p>
      </div>
    </>
  )
}