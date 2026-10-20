import { Link, useParams } from 'react-router'
import Seo from '../../components/Seo.jsx'
import { useAdminApi } from '../hooks/useAdminApi.js'
import PostForm from './PostForm.jsx'

export default function EditPost() {
  const { id } = useParams()
  const post = useAdminApi(`/admin/posts/${encodeURIComponent(id)}`)
  const notFound = post.status === 'error' && (post.error.status === 404 || post.error.status === 400)

  if (post.status === 'ready') {
    // key: opening a different post starts a fresh form
    return <PostForm key={post.data.id} initialPost={post.data} />
  }

  return (
    <>
      <Seo title="Edit post" noindex />
      <p>
        <Link to="/admin/posts" className="text-sm font-semibold">&larr; All posts</Link>
      </p>

      {post.status === 'loading' && (
        <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading post">
          <div className="skeleton h-9 w-1/3" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-72 w-full" />
        </div>
      )}

      {notFound && (
        <div className="card mx-auto mt-8 max-w-xl p-8 text-center">
          <h1 className="text-3xl">Post not found</h1>
          <p className="mt-3 text-ink-600">It may have been deleted, or the address is wrong.</p>
          <Link to="/admin/posts" className="btn btn-primary mt-6">Back to all posts</Link>
        </div>
      )}

      {post.status === 'error' && !notFound && post.error.status !== 401 && (
        <div className="alert alert-error mt-8 flex flex-wrap items-center justify-between gap-3" role="alert">
          <span>{post.error.message}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={post.reload}>Try again</button>
        </div>
      )}
    </>
  )
}