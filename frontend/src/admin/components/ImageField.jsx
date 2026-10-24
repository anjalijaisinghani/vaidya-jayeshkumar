import { useRef, useState } from 'react'
import { checkImageFile, IMAGE_ACCEPT } from '../lib/images.js'

// Chooses one picture (the article cover, the doctor's photo...).
//   value: the current image address ('' if none). onUpload(file) returns the new address.
//   id: used to build the ids of the label and hint, so two fields never clash.
export default function ImageField({
  value,
  onChange,
  onUpload,
  id = 'cover-image',
  label = 'Cover image',
  emptyText = 'No cover image',
  hint = 'JPG, PNG or WebP, up to 5 MB.',
  aspect = 'aspect-[16/9]',
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef(null)

  async function onFileChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = checkImageFile(file)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setBusy(true)
    try {
      onChange(await onUpload(file))
    } catch (err) {
      if (err.status !== 401) setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="field-label" id={`${id}-label`}>{label}</p>
      {value ? (
        <img src={value} alt="" className={`${aspect} w-full rounded-lg object-cover`} />
      ) : (
        <div className={`flex ${aspect} items-center justify-center rounded-lg border border-dashed border-cream-300 bg-cream-50 text-sm text-ink-600`}>
          {emptyText}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={busy}
          aria-describedby={`${id}-hint`}
          onClick={() => input.current?.click()}
        >
          {busy ? 'Uploading...' : value ? 'Replace image' : 'Choose image'}
        </button>
        {value && (
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        aria-labelledby={`${id}-label`}
        tabIndex={-1}
        onChange={onFileChosen}
      />
      <p id={`${id}-hint`} className="field-hint">{hint}</p>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}