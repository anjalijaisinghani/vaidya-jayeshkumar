import { Link } from 'react-router'
import { useApi } from '../hooks/useApi.js'
import PostCard, { PostCardSkeleton } from './PostCard.jsx'

// A titled row of up to three articles for the Home page. It disappears when there is nothing
// to show. The "primary" row also shows loading placeholders and error messages.
export default function PostRow({ title, headingId, path, viewAllTo, viewAllLabel, primary = false }) {
  const posts = useApi(path)

  if (posts.status === 'loading' && !primary) return null
  if (posts.status === 'error' && !primary) return null
  if (posts.status === 'ready' && posts.data.length === 0) return null

  return (
    <section className="py-10 sm:py-14" aria-labelledby={headingId}>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id={headingId} className="text-3xl">{title}</h2>
          <Link to={viewAllTo} className="text-sm font-semibold">{viewAllLabel} &rarr;</Link>
        </div>

        <div className="mt-8">
          {posts.status === 'loading' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}
          {posts.status === 'error' && (
            <p className="alert alert-error" role="alert">
              This section could not be loaded. Please try again later.
            </p>
          )}
          {posts.status === 'ready' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} level={3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}