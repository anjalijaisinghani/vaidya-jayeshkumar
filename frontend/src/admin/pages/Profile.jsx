import { useState } from 'react'
import Seo from '../../components/Seo.jsx'
import { useApi } from '../../hooks/useApi.js'
import { useProfile } from '../../context/useProfile.js'
import { formatDateTime } from '../../lib/format.js'
import { whatsappHref } from '../../lib/contact.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ImageField from '../components/ImageField.jsx'
import { useAdminRequest } from '../hooks/useAdminRequest.js'
import { useFormProtection } from '../hooks/useFormProtection.js'
import { backupKey } from '../lib/backup.js'
import { uploadImage } from '../lib/images.js'
import {
  FIELD_IDS,
  LIMITS,
  formFromProfile,
  hasPlaceholder,
  isProfileForm,
  isValidPhone,
  tidy,
  toPayload,
  validateProfile,
} from '../lib/profileValidation.js'

// One labelled text box (or text area, when `rows` is given) with its hint and error message.
function TextField({ id, label, value, onChange, error, hint, rows, maxLength, type = 'text', inputMode, autoComplete = 'off' }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    value,
    maxLength,
    onChange: (event) => onChange(event.target.value),
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: `field-input ${error ? 'field-input-error' : ''}`,
  }
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {rows ? (
        <textarea rows={rows} {...common} />
      ) : (
        <input type={type} inputMode={inputMode} autoComplete={autoComplete} {...common} />
      )}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}

function whatsappHint(value) {
  const base = 'Include the country code, for example +91 98765 43210.'
  const text = value.trim()
  if (!text || !isValidPhone(text)) return base
  const digits = text.replace(/\D/g, '')
  const assumed = !text.startsWith('+') && digits.length === 10
  return (
    <>
      {base} Visitors will be taken to <span className="font-medium break-all">{whatsappHref(text)}</span>.
      {assumed && ' This number has no country code, so it is treated as an Indian number (+91).'}
    </>
  )
}

function ProfileForm({ initial }) {
  const request = useAdminRequest()
  const site = useProfile() // the copy of the profile the public pages use

  const [form, setForm] = useState(() => formFromProfile(initial))
  const [saved, setSaved] = useState(() => JSON.stringify(formFromProfile(initial)))
  const [baseUpdatedAt, setBaseUpdatedAt] = useState(initial.updated_at ?? null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const dirty = JSON.stringify(form) !== saved
  const protection = useFormProtection({
    storageKey: backupKey('profile'),
    form,
    dirty,
    baseline: saved,
    baseUpdatedAt,
    isValid: isProfileForm,
  })
  const { blocker, restorable } = protection

  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))
  const upload = (file) => uploadImage(request, file)

  function restore() {
    const backed = protection.takeRestorable()
    if (backed) setForm(backed)
  }

  async function save() {
    const clean = tidy(form)
    const found = validateProfile(clean)
    setErrors(found)
    setServerError('')
    setNotice('')
    const firstProblem = Object.keys(FIELD_IDS).find((field) => found[field])
    if (firstProblem) {
      document.getElementById(FIELD_IDS[firstProblem])?.focus()
      return
    }

    setSaving(true)
    try {
      const res = await request('/admin/profile', { method: 'PATCH', body: toPayload(clean) })
      protection.markSaved()
      setForm(clean)
      setSaved(JSON.stringify(clean))
      setBaseUpdatedAt(res.data?.updated_at ?? null)
      setNotice('Profile saved. The website now shows these details.')
      site.reload() // the public pages (footer, About, Contact) pick up the change
    } catch (err) {
      if (err.status !== 401) setServerError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const problems = Object.values(errors)
  const stale = restorable && restorable.baseUpdatedAt !== (initial.updated_at ?? null)

  return (
    <>
      <div aria-live="polite" className="mt-4">
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
      </div>

      {hasPlaceholder(form) && (
        <p className="alert alert-info mt-4" role="note">
          Some fields still contain placeholder text (it starts with &ldquo;PLACEHOLDER&rdquo;). Replace it with the
          doctor&rsquo;s real details before the website goes live.
        </p>
      )}

      {restorable && (
        <div className="alert alert-info mt-4" role="region" aria-label="Unsaved changes found">
          <p className="font-semibold">We found unsaved changes from {formatDateTime(restorable.savedAt)}.</p>
          <p className="mt-1">
            They are kept only in this browser.
            {stale && ' The profile was changed after that copy was made, so saving it would replace those newer changes.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={restore}>Restore changes</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={protection.discardRestorable}>Discard</button>
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <div className="alert alert-error mt-4" role="alert">
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map((text) => <li key={text}>{text}</li>)}
          </ul>
        </div>
      )}
      {serverError && <p className="alert alert-error mt-4" role="alert">{serverError}</p>}

      <div className="mt-6 space-y-8">
        <section className="card space-y-5 p-6" aria-labelledby="basic-heading">
          <h2 id="basic-heading" className="text-2xl">Basic details</h2>
          <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
            <ImageField
              id="profile-photo"
              label="Profile photo"
              emptyText="No photo yet"
              aspect="aspect-[4/5]"
              hint="A clear portrait works best. JPG, PNG or WebP, up to 5 MB. Shown on the About page."
              value={form.imageUrl}
              onChange={set('imageUrl')}
              onUpload={upload}
            />
            <div className="space-y-5">
              <TextField id={FIELD_IDS.doctorName} label="Name" value={form.doctorName} onChange={set('doctorName')} error={errors.doctorName} maxLength={LIMITS.doctorName} />
              <TextField id={FIELD_IDS.specialization} label="Specialization" value={form.specialization} onChange={set('specialization')} error={errors.specialization} maxLength={LIMITS.specialization} />
              <TextField id={FIELD_IDS.experience} label="Experience" hint="For example: 20 years." value={form.experience} onChange={set('experience')} error={errors.experience} maxLength={LIMITS.experience} />
            </div>
          </div>
        </section>

        <section className="card space-y-5 p-6" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-2xl">About the doctor</h2>
          <TextField id={FIELD_IDS.qualifications} label="Qualifications" hint="One per line works well. Line breaks are kept." rows={4} value={form.qualifications} onChange={set('qualifications')} error={errors.qualifications} maxLength={LIMITS.qualifications} />
          <TextField id={FIELD_IDS.about} label="Introduction" hint="Shown on the About page. Line breaks are kept." rows={8} value={form.about} onChange={set('about')} error={errors.about} maxLength={LIMITS.about} />
        </section>

        <section className="card space-y-5 p-6" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-2xl">Contact and clinic</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField id={FIELD_IDS.phone} label="Phone number" type="tel" inputMode="tel" autoComplete="tel" hint="Shown with a Call button." value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={LIMITS.phone} />
            <TextField id={FIELD_IDS.whatsapp} label="WhatsApp number" type="tel" inputMode="tel" hint={whatsappHint(form.whatsapp)} value={form.whatsapp} onChange={set('whatsapp')} error={errors.whatsapp} maxLength={LIMITS.whatsapp} />
            <TextField id={FIELD_IDS.email} label="Email address" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} maxLength={LIMITS.email} />
            <TextField id={FIELD_IDS.mapUrl} label="Map link" type="url" inputMode="url" hint="In Google Maps, open the clinic, choose Share, and paste the link here." value={form.mapUrl} onChange={set('mapUrl')} error={errors.mapUrl} maxLength={LIMITS.mapUrl} />
          </div>
          <TextField id={FIELD_IDS.address} label="Clinic address" rows={3} hint="Line breaks are kept." value={form.address} onChange={set('address')} error={errors.address} maxLength={LIMITS.address} />
          <TextField id={FIELD_IDS.timings} label="Clinic timings" rows={3} hint="For example: Mon to Sat, 10:00 to 18:00. Line breaks are kept." value={form.timings} onChange={set('timings')} error={errors.timings} maxLength={LIMITS.timings} />
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
          <p className={`text-sm ${dirty ? 'font-medium text-earth-700' : 'text-ink-600'}`} role="status">
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        confirmLabel="Leave page"
        cancelLabel="Stay on this page"
        danger
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        <p>
          You have changes that are not saved to the website yet. If you leave now, a copy stays in this browser and
          you can restore it the next time you open this page.
        </p>
      </ConfirmDialog>
    </>
  )
}

export default function Profile() {
  const profile = useApi('/profile')
  const missing = profile.status === 'error' && profile.error.status === 404

  return (
    <>
      <Seo title="Doctor profile" noindex />
      <h1 className="text-3xl">Doctor profile</h1>
      <p className="mt-2 text-ink-600">
        These details appear on the About and Contact pages and in the footer of the website.
      </p>

      {profile.status === 'loading' && (
        <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading profile">
          <div className="skeleton h-40 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      )}

      {missing && (
        <p className="alert alert-error mt-8" role="alert">
          No profile record was found in the database. Load <code>database/seed.sql</code> (see the setup notes), then
          refresh this page.
        </p>
      )}

      {profile.status === 'error' && !missing && (
        <div className="alert alert-error mt-8 flex flex-wrap items-center justify-between gap-3" role="alert">
          <span>{profile.error.message}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={profile.reload}>Try again</button>
        </div>
      )}

      {profile.status === 'ready' && <ProfileForm key={profile.data.id} initial={profile.data} />}
    </>
  )
}