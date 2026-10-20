import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Pagination from '../../components/Pagination.jsx'
import Seo from '../../components/Seo.jsx'
import { formatDate } from '../../lib/format.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAdminApi } from '../hooks/useAdminApi.js'
import { useAdminRequest } from '../hooks/useAdminRequest.js'

const PAGE_SIZE = 20
const MAX_PAGE = 10000
const STATUS_TO_API = { published: 'PUBLISHED', draft: 'DRAFT' }

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const request = useAdminRequest()

  const statusParam = STATUS_TO_API[searchParams.get('status')] ? searchParams.get('status') : ''
  const category = searchParams.get('category') || ''
  const search = (searchParams.get('search') || '').trim().slice(0, 100)
  const page = Math.min(MAX_PAGE, Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1))
  const filtering = Boolean(statusParam || category || search)

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  if (statusParam) query.set('status', STATUS_TO_API[statusParam])
  if (category) query.set('category', category)
  if (search) query.set('search', search)

  const posts = useAdminApi(`/admin/posts?${query.toString()}`)
  const categories = useAdminApi('/admin/categories')

  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const [busyId, setBusyId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const headingRef = useRef(null)

  // The filters as address parameters, e.g. status=draft&page=2
  function paramsFor({ status: s, category: c, search: q, page: n }) {
    const params = new URLSearchParams()
    if (s) params.set('status', s)
    if (c) params.set('category', c)
    if (q) params.set('search', q)
    if (n && n > 1) params.set('page', String(n))
    return params
  }

  function urlFor(filters) {
    const text = paramsFor(filters).toString()
    return text ? `/admin/posts?${text}` : '/admin/posts'
  }

  // Changing a filter always goes back to the first page.
  function applyFilters(changes) {
    setSearchParams(paramsFor({ status: statusParam, category, search, ...changes }))
  }

  function onSearch(event) {
    event.preventDefault()
    applyFilters({ search: (new FormData(event.currentTarget).get('search') || '').toString().trim() })
  }

  async function setPublished(post, publish) {
    setNotice(null)
    setBusyId(post.id)
    try {
      await request(`/admin/posts/${post.id}`, {
        method: 'PATCH',
        body: { action: publish ? 'publish' : 'unpublish' },
      })
      setNotice({ type: 'success', text: `\u201C${post.title}\u201D is now ${publish ? 'published' : 'a draft'}.` })
      posts.reload()
    } catch (err) {
      if (err.status !== 401) setNotice({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    const post = pendingDelete
    setDeleting(true)
    setDeleteError('')
    try {
      await request(`/admin/posts/${post.id}`, { method: 'DELETE' })
      setPendingDelete(null)
      setNotice({ type: 'success', text: `\u201C${post.title}\u201D was deleted.` })
      // If that was the only post on this page, go back one page.
      if (posts.status === 'ready' && posts.data.length === 1 && page > 1) {
        setSearchParams(paramsFor({ status: statusParam, category, search, page: page - 1 }))
      } else {
        posts.reload()
      }
      headingRef.current?.focus()
    } catch (err) {
      if (err.status !== 401) setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Seo title="Posts" noindex />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl" ref={headingRef} tabIndex={-1}>Posts</h1>
          <p className="mt-2 text-ink-600">All articles, treatments and points, including drafts.</p>
        </div>
        <Link to="/admin/posts/new" className="btn btn-primary">New post</Link>
      </div>

      <div className="mt-6 space-y-3" aria-live="polite">
        {notice && (
          <p className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-error'}`} role={notice.type === 'success' ? 'status' : 'alert'}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_12rem_16rem]">
        <form role="search" onSubmit={onSearch} key={search}>
          <label htmlFor="admin-post-search" className="field-label">Search</label>
          <div className="flex gap-2">
            <input
              id="admin-post-search"
              name="search"
              type="search"
              maxLength={100}
              defaultValue={search}
              placeholder="Title or excerpt..."
              className="field-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>

        <div>
          <label htmlFor="admin-post-status" className="field-label">Status</label>
          <select
            id="admin-post-status"
            className="field-input"
            value={statusParam}
            onChange={(event) => applyFilters({ status: event.target.value })}
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        <div>
          <label htmlFor="admin-post-category" className="field-label">Category</label>
          <select
            id="admin-post-category"
            className="field-input"
            value={category}
            onChange={(event) => applyFilters({ category: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.status === 'ready' &&
              categories.data.map((c) => (
                <option key={c.id} value={c.slug}>{c.name} ({c.post_count})</option>
              ))}
          </select>
        </div>
      </div>

      <div className="mt-8" aria-busy={posts.status === 'loading' || Boolean(posts.refreshing)}>
        {posts.status === 'loading' && (
          <div className="card divide-y divide-cream-300" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-2 p-4">
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {posts.status === 'error' && posts.error.status !== 401 && (
          <div className="alert alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
            <span>{posts.error.message}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={posts.reload}>Try again</button>
          </div>
        )}

        {posts.status === 'ready' && (
          <>
            <p className="mb-4 text-sm text-ink-600" role="status">
              {posts.meta.total === 0
                ? 'No posts found'
                : `${posts.meta.total} ${posts.meta.total === 1 ? 'post' : 'posts'}${filtering ? ' found' : ''}`}
            </p>

            {posts.data.length > 0 && (
              <ul className={`card divide-y divide-cream-300 ${posts.refreshing ? 'opacity-60' : ''}`}>
                {posts.data.map((post) => (
                  <li key={post.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          className="font-serif text-lg font-semibold break-words text-leaf-800 no-underline hover:underline"
                        >
                          {post.title}
                        </Link>
                        <StatusBadge status={post.status} />
                        {post.is_featured ? (
                          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink-700">Featured</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">
                        {post.category_name}
                        {' \u00B7 '}Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                        {post.status === 'PUBLISHED' && post.published_at && (
                          <>
                            {' \u00B7 '}Published <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        aria-label={`Edit: ${post.title}`}
                      >
                        Edit
                      </Link>
                      {post.status === 'PUBLISHED' && (
                        <a
                          href={`/articles/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          aria-label={`View: ${post.title} (opens in a new tab)`}
                        >
                          View
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={busyId === post.id}
                        aria-label={`${post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}: ${post.title}`}
                        onClick={() => setPublished(post, post.status !== 'PUBLISHED')}
                      >
                        {busyId === post.id ? 'Working...' : post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === post.id}
                        aria-label={`Delete: ${post.title}`}
                        onClick={() => {
                          setDeleteError('')
                          setPendingDelete(post)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {posts.data.length === 0 && posts.meta.total > 0 && (
              <div className="card p-8 text-center">
                <h2 className="text-xl">That page does not exist</h2>
                <Link to={urlFor({ status: statusParam, category, search })} className="btn btn-primary mt-5">
                  Go to the first page
                </Link>
              </div>
            )}

            {posts.meta.total === 0 && (
              <div className="card p-8 text-center">
                <h2 className="text-xl">{filtering ? 'No posts match your filters' : 'No posts yet'}</h2>
                <p className="mt-2 text-ink-600">
                  {filtering ? 'Try different words or clear the filters.' : 'Posts you create will appear here.'}
                </p>
                {filtering ? (
                  <Link to="/admin/posts" className="btn btn-primary mt-5">Clear search and filters</Link>
                ) : (
                  <Link to="/admin/posts/new" className="btn btn-primary mt-5">Write your first post</Link>
                )}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={posts.meta.totalPages}
              buildTo={(n) => urlFor({ status: statusParam, category, search, page: n })}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this post?"
        confirmLabel="Delete post"
        danger
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <p>
          <strong>{pendingDelete?.title}</strong> will be permanently deleted. Images used only by this post are
          removed too. This cannot be undone.
        </p>
        {pendingDelete?.status === 'PUBLISHED' && (
          <p className="mt-2">It is currently published, so it will disappear from the website.</p>
        )}
      </ConfirmDialog>
    </>
  )
}