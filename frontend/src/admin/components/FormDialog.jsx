import { useEffect, useId, useRef } from 'react'

// A small pop-up form (used for links and image descriptions), built on the browser's own
// <dialog>: it traps keyboard focus, closes with Esc and returns focus afterwards.
export default function FormDialog({
  open,
  title,
  submitLabel = 'OK',
  busy = false,
  error = '',
  onSubmit,
  onCancel,
  extraAction = null,
  children,
}) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onCancel()
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-cream-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {open && (
        <form
          className="p-6 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          noValidate
        >
          <h2 id={titleId} className="text-2xl">{title}</h2>
          <div className="mt-4 space-y-4">{children}</div>
          {error && <p className="alert alert-error mt-4" role="alert">{error}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            {extraAction}
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Please wait...' : submitLabel}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}