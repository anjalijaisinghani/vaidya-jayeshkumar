import { Link } from 'react-router'
import { useAdminApi } from '../hooks/useAdminApi.js'
import { useAuth } from '../auth/useAuth.js'

const STATS = [
  ['total_posts', 'Total posts'],
  ['published_posts', 'Published'],
  ['draft_posts', 'Drafts'],
  ['total_categories', 'Categories'],
]

export default function Dashboard() {
  const { admin } = useAuth()
  const stats = useAdminApi('/admin/dashboard')

  return (
    <>
      <h1 className="text-3xl">Welcome{admin?.name ? `, ${admin.name}` : ''}</h1>
      <p className="mt-2 text-ink-600">Here is an overview of the website content.</p>
      <p className="mt-6">
        <Link to="/admin/posts/new" className="btn btn-primary">Write a new post</Link>
      </p>

      <section className="mt-8" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Content overview</h2>

        {stats.status === 'loading' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {STATS.map(([key]) => (
              <div key={key} className="card p-6">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton mt-4 h-9 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {stats.status === 'error' && stats.error.status !== 401 && (
          <div className="alert alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
            <span>{stats.error.message}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={stats.reload}>Try again</button>
          </div>
        )}

        {stats.status === 'ready' && (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(([key, label]) => (
              <div key={key} className="card p-6">
                <dt className="text-sm font-medium text-ink-600">{label}</dt>
                <dd className="mt-2 font-serif text-4xl font-semibold text-leaf-800">{stats.data[key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Temporary note: removed when the posts, categories and profile pages are added. */}
      <p className="alert alert-info mt-8" role="note">
        More tools (posts, categories and the doctor's profile) are being added step by step.
      </p>
    </>
  )
}