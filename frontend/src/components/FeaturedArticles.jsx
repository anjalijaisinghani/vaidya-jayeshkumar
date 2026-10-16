import { Link } from 'react-router'
import { useApi } from '../hooks/useApi.js'
import PostCard, { PostCardSkeleton } from './PostCard.jsx'
import SectionPlaceholder from './SectionPlaceholder.jsx'

export default function FeaturedArticles() {
  const featured = useApi('/posts/featured?limit=3')

  return (
    <section className="section" aria-labelledby="featured-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="featured-heading" className="text-3xl">Featured articles</h2>
          <Link to="/articles" className="text-sm font-semibold">View all articles &rarr;</Link>
        </div>

        <div className="mt-8">
          {featured.status === 'loading' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}
          {featured.status === 'error' && (
            <p className="alert alert-error" role="alert">
              Featured articles could not be loaded. Please try again later.
            </p>
          )}
          {featured.status === 'ready' && featured.data.length === 0 && (
            <SectionPlaceholder title="Featured articles coming soon">
              Articles chosen by the doctor will appear here.
            </SectionPlaceholder>
          )}
          {featured.status === 'ready' && featured.data.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.map((post) => (
                <PostCard key={post.id} post={post} level={3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}