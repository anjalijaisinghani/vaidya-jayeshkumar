import { Link } from 'react-router'
import emblem from '../assets/emblem.webp'
import { formatDate } from '../lib/format.js'

// One article in a list. The whole card is clickable through the title link.
// level: heading level for the title (2 on list pages, 3 when under a section heading).
export default function PostCard({ post, level = 2 }) {
  const Heading = level === 3 ? 'h3' : 'h2'

  return (
    <article className="card card-hover relative flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-leaf-600">
      {/* A fixed-shape box. The picture is laid over it (absolute), so its own proportions can never change the box. */}
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-leaf-100">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={emblem} alt="" width="192" height="190" className="h-20 w-auto opacity-40" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-earth-700 uppercase">{post.category_name}</p>
        <Heading className="mt-1 text-xl">
          <Link
            to={`/articles/${post.slug}`}
            className="text-leaf-800 no-underline after:absolute after:inset-0 hover:underline"
          >
            {post.title}
          </Link>
        </Heading>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-600">{post.excerpt}</p>}
        {post.published_at && (
          <p className="mt-auto pt-4 text-xs text-ink-600">
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          </p>
        )}
      </div>
    </article>
  )
}

// Grey placeholder shown while articles are loading.
export function PostCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  )
}