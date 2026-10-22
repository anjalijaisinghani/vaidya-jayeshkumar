import { useEffect, useId, useRef } from 'react'

// A "Are you sure?" box built on the browser's own <dialog>, which traps keyboard focus,
// closes with the Esc key and returns focus afterwards.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  error = '',
  danger = false,
  onConfirm,
  onCancel,
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
        // Esc key: we decide what happens, so a running request is never interrupted.
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(event) => {
        // A click on the dimmed area around the box counts as "cancel".
        if (event.target === ref.current && !busy) onCancel()
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-cream-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {open && (
        <div className="p-6 sm:p-8">
          <h2 id={titleId} className="text-2xl">{title}</h2>
          <div className="mt-3 text-ink-700">{children}</div>
          {error && (
            <p className="alert alert-error mt-4" role="alert">{error}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}