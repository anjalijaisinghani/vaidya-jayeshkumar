import { useRef, useState } from 'react'
import { Link } from 'react-router'
import Seo from '../../components/Seo.jsx'
import { listPageFor } from '../../lib/site.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import FormDialog from '../components/FormDialog.jsx'
import { useAdminApi } from '../hooks/useAdminApi.js'
import { useAdminRequest } from '../hooks/useAdminRequest.js'

const NAME_MAX = 120
const DESCRIPTION_MAX = 1000

// The two categories that power a page of their own (the server refuses to delete them).
const PAGE_NAMES = { 'ayurvedic-treatments': 'Treatments', 'ayurvedic-points': 'Ayurvedic Points' }

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function countText(category) {
  if (category.post_count === 0) return 'No posts yet'
  return `${plural(category.post_count, 'post')} \u00B7 ${category.published_count} published`
}

// Why a category cannot be deleted, or '' when it can.
function deleteBlocker(category) {
  if (category.is_protected) {
    return 'Used by a main page of the website, so it cannot be deleted. You can rename it.'
  }
  if (category.post_count > 0) {
    return `Has ${plural(category.post_count, 'post')}. Move or delete them first.`
  }
  return ''
}

export default function Categories() {
  const request = useAdminRequest()
  const categories = useAdminApi('/admin/categories')

  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const [editing, setEditing] = useState(null) // null | 'new' | a category being edited
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const headingRef = useRef(null)

  const creating = editing === 'new'
  const list = categories.status === 'ready' ? categories.data : []

  function openNew() {
    setName('')
    setDescription('')
    setFieldErrors({})
    setFormError('')
    setEditing('new')
  }

  function openEdit(category) {
    setName(category.name)
    setDescription(category.description ?? '')
    setFieldErrors({})
    setFormError('')
    setEditing(category)
  }

  async function submit() {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const found = {}
    if (!trimmedName) found.name = 'Enter a name for the category.'
    else if (trimmedName.length > NAME_MAX) found.name = `The name must be ${NAME_MAX} characters or fewer.`
    else if (list.some((c) => c.id !== editing?.id && c.name.toLowerCase() === trimmedName.toLowerCase())) {
      found.name = 'A category with this name already exists.'
    }
    if (trimmedDescription.length > DESCRIPTION_MAX) {
      found.description = `The description must be ${DESCRIPTION_MAX} characters or fewer.`
    }
    setFieldErrors(found)
    setFormError('')
    if (found.name) {
      document.getElementById('category-name')?.focus()
      return
    }
    if (found.description) {
      document.getElementById('category-description')?.focus()
      return
    }

    setSaving(true)
    try {
      const body = { name: trimmedName, description: trimmedDescription }
      if (creating) {
        await request('/admin/categories', { method: 'POST', body })
        setNotice({ type: 'success', text: `Category \u201C${trimmedName}\u201D was added.` })
      } else {
        await request(`/admin/categories/${editing.id}`, { method: 'PATCH', body })
        setNotice({ type: 'success', text: `Category \u201C${trimmedName}\u201D was saved.` })
      }
      setEditing(null)
      categories.reload()
      headingRef.current?.focus()
    } catch (err) {
      if (err.status !== 401) setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    const category = pendingDelete
    setDeleting(true)
    setDeleteError('')
    try {
      await request(`/admin/categories/${category.id}`, { method: 'DELETE' })
      setPendingDelete(null)
      setNotice({ type: 'success', text: `Category \u201C${category.name}\u201D was deleted.` })
      categories.reload()
      headingRef.current?.focus()
    } catch (err) {
      if (err.status !== 401) setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Seo title="Categories" noindex />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl" ref={headingRef} tabIndex={-1}>Categories</h1>
          <p className="mt-2 max-w-2xl text-ink-600">
            Categories group the articles on the website. Every post belongs to one category.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>New category</button>
      </div>

      <div className="mt-6" aria-live="polite">
        {notice && (
          <p className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-error'}`} role={notice.type === 'success' ? 'status' : 'alert'}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="mt-6" aria-busy={categories.status === 'loading' || Boolean(categories.refreshing)}>
        {categories.status === 'loading' && (
          <div className="card divide-y divide-cream-300" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2 p-5">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-1/4" />
              </div>
            ))}
          </div>
        )}

        {categories.status === 'error' && categories.error.status !== 401 && (
          <div className="alert alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
            <span>{categories.error.message}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={categories.reload}>Try again</button>
          </div>
        )}

        {categories.status === 'ready' && list.length === 0 && (
          <div className="card p-8 text-center">
            <h2 className="text-xl">No categories yet</h2>
            <p className="mt-2 text-ink-600">Add a category before writing posts.</p>
          </div>
        )}

        {categories.status === 'ready' && list.length > 0 && (
          <ul className={`card divide-y divide-cream-300 ${categories.refreshing ? 'opacity-60' : ''}`}>
            {list.map((category) => {
              const reason = deleteBlocker(category)
              const reasonId = `category-${category.id}-reason`
              return (
                <li key={category.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg font-semibold break-words text-leaf-800">{category.name}</span>
                      {category.is_protected && (
                        <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink-700">
                          Used by the {PAGE_NAMES[category.slug] ?? 'main'} page
                        </span>
                      )}
                    </p>
                    {category.description && (
                      <p className="mt-1 max-w-2xl text-sm break-words text-ink-700">{category.description}</p>
                    )}
                    <p className="mt-1 text-sm text-ink-600">{countText(category)}</p>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="flex flex-wrap gap-2">
                      {category.published_count > 0 && (
                        <a
                          href={listPageFor(category.slug).listTo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          aria-label={`View on website: ${category.name} (opens in a new tab)`}
                        >
                          View on website
                        </a>
                      )}
                      {category.post_count > 0 && (
                        <Link
                          to={`/admin/posts?category=${encodeURIComponent(category.slug)}`}
                          className="btn btn-secondary btn-sm"
                          aria-label={`View posts: ${category.name}`}
                        >
                          View posts
                        </Link>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        aria-label={`Edit: ${category.name}`}
                        onClick={() => openEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={Boolean(reason)}
                        aria-label={`Delete: ${category.name}`}
                        aria-describedby={reason ? reasonId : undefined}
                        onClick={() => {
                          setDeleteError('')
                          setPendingDelete(category)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    {reason && <p id={reasonId} className="max-w-xs text-xs text-ink-600 lg:text-right">{reason}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <FormDialog
        open={Boolean(editing)}
        title={creating ? 'New category' : 'Edit category'}
        submitLabel={creating ? 'Add category' : 'Save'}
        busy={saving}
        error={formError}
        onSubmit={submit}
        onCancel={() => setEditing(null)}
      >
        <div>
          <label htmlFor="category-name" className="field-label">Name</label>
          <input
            id="category-name"
            type="text"
            value={name}
            maxLength={NAME_MAX}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            className={`field-input ${fieldErrors.name ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'category-name-error' : undefined}
          />
          {fieldErrors.name && <p id="category-name-error" className="field-error">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="category-description" className="field-label">Description (optional)</label>
          <textarea
            id="category-description"
            rows={3}
            value={description}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => setDescription(event.target.value)}
            className={`field-input ${fieldErrors.description ? 'field-input-error' : ''}`}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? 'category-description-error' : 'category-description-hint'}
          />
          <p id="category-description-hint" className="field-hint">A short note for your own reference.</p>
          {fieldErrors.description && <p id="category-description-error" className="field-error">{fieldErrors.description}</p>}
        </div>
        {!creating && (
          <p className="field-hint">
            Renaming does not change the category&rsquo;s web address, so links that already exist keep working.
          </p>
        )}
      </FormDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        confirmLabel="Delete category"
        danger
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <p>
          <strong>{pendingDelete?.name}</strong> will be permanently deleted. It has no posts, so no articles are
          affected. This cannot be undone.
        </p>
      </ConfirmDialog>
    </>
  )
}