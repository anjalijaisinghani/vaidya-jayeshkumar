import { Link, useParams } from 'react-router'
import Seo from '../components/Seo.jsx'
import { useApi } from '../hooks/useApi.js'
import { formatDate } from '../lib/format.js'
import { listPageFor } from '../lib/site.js'

export default function ArticleDetail() {
  const { slug } = useParams()
  const post = useApi(`/posts/${encodeURIComponent(slug)}`)
  const notFound = post.status === 'error' && post.error.status === 404
  const article = post.status === 'ready' ? post.data : null
  const where = listPageFor(article?.category_slug)

  return (
    <>
      <Seo
        title={article ? article.title : notFound ? 'Article not found' : 'Article'}
        description={article?.excerpt || undefined}
      />
      <div className="container-page max-w-3xl py-10 sm:py-14">
        <p>
          <Link to={where.backTo} className="text-sm font-semibold">&larr; {where.backLabel}</Link>
        </p>

        {post.status === 'loading' && (
          <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading article">
            <div className="skeleton h-4 w-1/4" />
            <div className="skeleton h-10 w-4/5" />
            <div className="skeleton aspect-[16/9] w-full" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        )}

        {notFound && (
          <div className="card mt-8 p-8 text-center">
            <h1 className="text-3xl">Article not found</h1>
            <p className="mt-3 text-ink-600">
              This article may have been moved, unpublished, or the address may be mistyped.
            </p>
            <Link to="/articles" className="btn btn-primary mt-6">Browse all articles</Link>
          </div>
        )}

        {post.status === 'error' && !notFound && (
          <div className="alert alert-error mt-8 flex flex-wrap items-center justify-between gap-3" role="alert">
            <span>{post.error.message}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={post.reload}>Try again</button>
          </div>
        )}

        {article && (
          <article className="mt-8">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase">
              <Link to={where.listTo} className="text-earth-700 no-underline hover:underline">
                {article.category_name}
              </Link>
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{article.title}</h1>
            {article.published_at && (
              <p className="mt-3 text-sm text-ink-600">
                <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              </p>
            )}

            {article.cover_image_url && (
              <img
                src={article.cover_image_url}
                alt=""
                className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            )}

            {/* The server cleans this HTML when the article is saved (scripts, event handlers and
                outside images are removed), so it is safe to display as-is. */}
            <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: article.content }} />

            {/* Placeholder wording: the final medical disclaimer is approved by the doctor. */}
            <p className="alert alert-info mt-12" role="note">
              This article is for general information and does not replace advice from a qualified
              healthcare professional. Read the full <Link to="/disclaimer">disclaimer</Link>.
            </p>
          </article>
        )}
      </div>
    </>
  )
}