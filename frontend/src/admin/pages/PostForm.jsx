import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useLocation, useNavigate } from 'react-router'
import Seo from '../../components/Seo.jsx'
import { formatDateTime } from '../../lib/format.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import CoverImageField from '../components/CoverImageField.jsx'
import RichTextEditor from '../components/RichTextEditor.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAdminApi } from '../hooks/useAdminApi.js'
import { useAdminRequest } from '../hooks/useAdminRequest.js'
import { useUnsavedWarning } from '../hooks/useUnsavedWarning.js'
import { backupKey, clearBackup, readBackup, writeBackup } from '../lib/backup.js'
import { uploadImage } from '../lib/images.js'
import { useReportUnsaved } from '../unsaved.js'

function formFrom(post) {
  return {
    title: post?.title ?? '',
    categoryId: post ? String(post.category_id) : '',
    excerpt: post?.excerpt ?? '',
    coverUrl: post?.cover_image_url ?? '',
    featured: Boolean(post?.is_featured),
    body: post?.content ?? '',
  }
}

function validate(form, { needsBody, bodyEmpty }) {
  const errors = {}
  const title = form.title.trim()
  if (!title) errors.title = 'Enter a title.'
  else if (title.length > 200) errors.title = 'The title must be 200 characters or fewer.'
  if (!form.categoryId) errors.category = 'Choose a category.'
  if (needsBody && bodyEmpty) errors.body = 'Add some text (or a picture) before publishing.'
  if (form.excerpt.trim().length > 500) errors.excerpt = 'The summary must be 500 characters or fewer.'
  return errors
}

const SUCCESS_TEXT = {
  draft: 'Draft saved.',
  save: 'Changes saved.',
  publish: 'Published.',
  unpublish: 'Moved back to drafts.',
}

// The new-post and edit-post form. initialPost is null for a new post.
export default function PostForm({ initialPost }) {
  const request = useAdminRequest()
  const navigate = useNavigate()
  const location = useLocation()
  const categories = useAdminApi('/admin/categories')

  const [post, setPost] = useState(initialPost)
  const [form, setForm] = useState(() => formFrom(initialPost))
  const [saved, setSaved] = useState(() => JSON.stringify(formFrom(initialPost)))
  const [bodyEmpty, setBodyEmpty] = useState(!initialPost?.content)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState('')
  const [notice, setNotice] = useState(location.state?.notice ?? '')

  // Show the "saved" message once, then forget it so a reload does not repeat it.
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = JSON.stringify(form) !== saved
  useUnsavedWarning(dirty) // closing or reloading the tab
  useReportUnsaved(dirty) // signing out (the admin layout asks first)

  // ---- Protection against losing work ----
  const key = backupKey(initialPost?.id)
  const editorRef = useRef(null)
  const [restorable, setRestorable] = useState(null) // a backup found when the form opened
  const dirtyRef = useRef(false)
  const latest = useRef({ form, dirty, base: null })

  useEffect(() => {
    dirtyRef.current = dirty
    latest.current = { form, dirty, base: post?.updated_at ?? null }
  }, [form, dirty, post])

  // Moving to another admin page with unsaved changes asks first (links and the Back button).
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
    [],
  )
  const blocker = useBlocker(shouldBlock)

  // While there are unsaved changes, keep a copy in this browser a moment after each pause in typing.
  useEffect(() => {
    if (!dirty) return undefined
    const timer = setTimeout(() => writeBackup(key, form, post?.updated_at), 700)
    return () => clearTimeout(timer)
  }, [form, dirty, key, post])

  // ...and write the latest copy straight away when the page is left or the tab is closed.
  useEffect(() => {
    const flush = () => {
      if (latest.current.dirty) writeBackup(key, latest.current.form, latest.current.base)
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [key])

  // Everything is saved on the server, so the browser copy is no longer needed.
  function markSaved() {
    dirtyRef.current = false
    latest.current = { ...latest.current, dirty: false }
    clearBackup(key)
  }

  const isPublished = post?.status === 'PUBLISHED'
  const update = (changes) => setForm((current) => ({ ...current, ...changes }))

  // The editor tidies the stored text once when it opens; that is the starting point for "unsaved changes".
  function onEditorReady(html, isEmpty) {
    const body = isEmpty ? '' : html
    setForm((current) => ({ ...current, body }))
    setSaved((current) => JSON.stringify({ ...JSON.parse(current), body }))
    setBodyEmpty(isEmpty)

    // Is there unsaved work from an earlier visit (crash, closed tab, expired session)?
    const backup = readBackup(key)
    if (!backup) return
    const baseline = JSON.stringify({ ...formFrom(initialPost), body })
    if (JSON.stringify(backup.form) === baseline) clearBackup(key)
    else setRestorable(backup)
  }

  function restoreBackup() {
    const { form: backed } = restorable
    setForm(backed)
    setBodyEmpty(backed.body === '')
    editorRef.current?.setHtml(backed.body)
    setRestorable(null)
  }

  function discardBackup() {
    clearBackup(key)
    setRestorable(null)
  }

  function onEditorChange(html, isEmpty) {
    setForm((current) => ({ ...current, body: isEmpty ? '' : html }))
    setBodyEmpty(isEmpty)
  }

  function focusFirstProblem(found) {
    if (found.title) document.getElementById('post-title')?.focus()
    else if (found.category) document.getElementById('post-category')?.focus()
    else if (found.body) document.querySelector('#post-body .ProseMirror')?.focus()
    else if (found.excerpt) document.getElementById('post-excerpt')?.focus()
  }

  // kind: 'draft' (save as draft), 'save' (save a published post), 'publish', 'unpublish'
  async function save(kind) {
    const found = validate(form, { needsBody: kind === 'publish', bodyEmpty })
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length > 0) {
      setNotice('')
      focusFirstProblem(found)
      return
    }

    const payload = {
      title: form.title.trim(),
      category_id: Number(form.categoryId),
      excerpt: form.excerpt.trim(),
      content: form.body,
      cover_image_url: form.coverUrl || null,
      is_featured: form.featured,
    }

    setNotice('')
    setSaving(kind)
    try {
      if (!post) {
        const res = await request('/admin/posts', {
          method: 'POST',
          body: { ...payload, action: kind === 'publish' ? 'publish' : 'draft' },
        })
        markSaved() // before moving on, or the "leave without saving?" box would appear
        navigate(`/admin/posts/${res.data.id}/edit`, {
          replace: true,
          state: { notice: SUCCESS_TEXT[kind] },
        })
        return
      }
      const action = kind === 'publish' || kind === 'unpublish' ? kind : undefined
      const res = await request(`/admin/posts/${post.id}`, {
        method: 'PATCH',
        body: action ? { ...payload, action } : payload,
      })
      markSaved()
      setPost(res.data)
      setSaved(JSON.stringify(form))
      setNotice(SUCCESS_TEXT[kind])
    } catch (err) {
      if (err.status !== 401) setServerError(err.message)
    } finally {
      setSaving('')
    }
  }

  const upload = (file) => uploadImage(request, file)
  const problems = Object.values(errors)
  const busy = Boolean(saving)

  return (
    <>
      <Seo title={post ? 'Edit post' : 'New post'} noindex />
      <p>
        <Link to="/admin/posts" className="text-sm font-semibold">&larr; All posts</Link>
      </p>
      <h1 className="mt-4 text-3xl">{post ? 'Edit post' : 'New post'}</h1>

      <div aria-live="polite" className="mt-4">
        {notice && (
          <p className="alert alert-success" role="status">
            {notice}
            {isPublished && (
              <>
                {' '}
                <a href={`/articles/${post.slug}`} target="_blank" rel="noopener noreferrer">
                  View on the website (opens in a new tab)
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {restorable && (
        <div className="alert alert-info mt-4" role="region" aria-label="Unsaved changes found">
          <p className="font-semibold">We found unsaved changes from {formatDateTime(restorable.savedAt)}.</p>
          <p className="mt-1">
            They are kept only in this browser.
            {restorable.baseUpdatedAt !== (initialPost?.updated_at ?? null) &&
              ' This post was changed after that copy was made, so saving it would replace those newer changes.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={restoreBackup}>
              Restore changes
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={discardBackup}>
              Discard
            </button>
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

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div>
            <label htmlFor="post-title" className="field-label">Title</label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(event) => update({ title: event.target.value })}
              className={`field-input text-lg ${errors.title ? 'field-input-error' : ''}`}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'post-title-error' : undefined}
              autoComplete="off"
            />
            {errors.title && <p id="post-title-error" className="field-error">{errors.title}</p>}
          </div>

          <div id="post-body">
            <p id="post-body-label" className="field-label">Article text</p>
            <RichTextEditor
              ref={editorRef}
              initialHtml={form.body}
              onReady={onEditorReady}
              onChange={onEditorChange}
              onUploadImage={upload}
              labelId="post-body-label"
              describedBy={errors.body ? 'post-body-error' : undefined}
              invalid={Boolean(errors.body)}
            />
            {errors.body && <p id="post-body-error" className="field-error">{errors.body}</p>}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-600">Status</span>
              {post ? (
                <StatusBadge status={post.status} />
              ) : (
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink-700">New</span>
              )}
            </div>
            <p className={`text-sm ${dirty ? 'font-medium text-earth-700' : 'text-ink-600'}`} role="status">
              {dirty ? 'Unsaved changes' : post ? 'All changes saved' : 'Not saved yet'}
            </p>

            <div className="flex flex-col gap-2" aria-busy={busy}>
              {isPublished ? (
                <>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('save')}>
                    {saving === 'save' ? 'Saving...' : 'Save changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => save('unpublish')}>
                    {saving === 'unpublish' ? 'Working...' : 'Unpublish'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('publish')}>
                    {saving === 'publish' ? 'Publishing...' : 'Publish'}
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => save('draft')}>
                    {saving === 'draft' ? 'Saving...' : 'Save draft'}
                  </button>
                </>
              )}
            </div>

            {post && (
              <p className="text-xs break-all text-ink-600">Web address: /articles/{post.slug}</p>
            )}
          </div>

          <div className="card space-y-5 p-5">
            <div>
              <label htmlFor="post-category" className="field-label">Category</label>
              <select
                id="post-category"
                value={form.categoryId}
                onChange={(event) => update({ categoryId: event.target.value })}
                className={`field-input ${errors.category ? 'field-input-error' : ''}`}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'post-category-error' : undefined}
              >
                <option value="">{categories.status === 'loading' ? 'Loading...' : 'Choose a category'}</option>
                {categories.status === 'ready' &&
                  categories.data.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
              </select>
              {errors.category && <p id="post-category-error" className="field-error">{errors.category}</p>}
              {categories.status === 'error' && categories.error.status !== 401 && (
                <p className="field-error" role="alert">The categories could not be loaded.</p>
              )}
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update({ featured: event.target.checked })}
                className="mt-1 size-4 accent-leaf-700"
              />
              <span>
                <span className="font-medium">Featured article</span>
                <span className="block text-sm text-ink-600">Shown on the home page once it is published.</span>
              </span>
            </label>
          </div>

          <div className="card p-5">
            <CoverImageField value={form.coverUrl} onChange={(coverUrl) => update({ coverUrl })} onUpload={upload} />
          </div>

          <div className="card p-5">
            <label htmlFor="post-excerpt" className="field-label">Short summary</label>
            <textarea
              id="post-excerpt"
              rows={4}
              value={form.excerpt}
              onChange={(event) => update({ excerpt: event.target.value })}
              className={`field-input ${errors.excerpt ? 'field-input-error' : ''}`}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? 'post-excerpt-error post-excerpt-hint' : 'post-excerpt-hint'}
            />
            <p id="post-excerpt-hint" className="field-hint">
              Shown on article cards. Leave empty to create it from the start of the text.{' '}
              <span aria-hidden="true">{form.excerpt.length}/500</span>
            </p>
            {errors.excerpt && <p id="post-excerpt-error" className="field-error">{errors.excerpt}</p>}
          </div>
        </aside>
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
          you can restore it the next time you open this post.
        </p>
      </ConfirmDialog>
    </>
  )
}