import { Link, useSearchParams } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import Pagination from '../components/Pagination.jsx'
import PostCard, { PostCardSkeleton } from '../components/PostCard.jsx'
import Seo from '../components/Seo.jsx'
import { useApi } from '../hooks/useApi.js'

const PAGE_SIZE = 9
const MAX_PAGE = 10000

// Builds an address like /articles?category=blogs&search=herbs&page=2
function articlesUrl({ category, search, page }) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (search) params.set('search', search)
  if (page && page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/articles?${query}` : '/articles'
}

const chipBase = 'rounded-full border px-4 py-2 text-sm font-medium no-underline transition-colors'
const chipIdle = 'border-cream-300 bg-white text-ink-700 hover:border-leaf-600 hover:text-leaf-900'
const chipActive = 'border-leaf-800 bg-leaf-800 text-white'

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const search = (searchParams.get('search') || '').trim().slice(0, 100)
  const page = Math.min(MAX_PAGE, Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1))
  const filtering = Boolean(category || search)

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  if (category) query.set('category', category)
  if (search) query.set('search', search)

  const posts = useApi(`/posts?${query.toString()}`)
  const categories = useApi('/categories')
  const usedCategories = categories.status === 'ready' ? categories.data.filter((c) => c.post_count > 0) : []

  function onSearch(event) {
    event.preventDefault()
    const value = (new FormData(event.currentTarget).get('search') || '').toString().trim()
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (value) next.set('search', value)
    setSearchParams(next)
  }

  return (
    <>
      <Seo title="Articles" description="Ayurvedic articles and blogs from Vaidya Jayeshkumar." />
      <PageHeader eyebrow="Articles" title="Articles">
        Ayurvedic articles and blogs from the doctor.
      </PageHeader>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-5">
            <form role="search" onSubmit={onSearch} className="flex max-w-xl gap-2" key={search}>
              <label htmlFor="article-search" className="sr-only">Search articles</label>
              <input
                id="article-search"
                name="search"
                type="search"
                maxLength={100}
                defaultValue={search}
                placeholder="Search articles..."
                className="field-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {usedCategories.length > 0 && (
              <nav aria-label="Categories">
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <Link
                      to={articlesUrl({ search })}
                      aria-current={category ? undefined : 'true'}
                      className={`${chipBase} ${category ? chipIdle : chipActive}`}
                    >
                      All
                    </Link>
                  </li>
                  {usedCategories.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={articlesUrl({ category: c.slug, search })}
                        aria-current={category === c.slug ? 'true' : undefined}
                        className={`${chipBase} ${category === c.slug ? chipActive : chipIdle}`}
                      >
                        {c.name} <span className="opacity-80">({c.post_count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

          <div className="mt-8" aria-busy={posts.status === 'loading'}>
            {posts.status === 'loading' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)}
              </div>
            )}

            {posts.status === 'error' && (
              <div className="alert alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
                <span>{posts.error.message}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={posts.reload}>Try again</button>
              </div>
            )}

            {posts.status === 'ready' && (
              <>
                <p className="mb-6 text-sm text-ink-600" role="status">
                  {posts.meta.total === 0
                    ? 'No articles found'
                    : `${posts.meta.total} ${posts.meta.total === 1 ? 'article' : 'articles'}${filtering ? ' found' : ''}`}
                </p>

                {posts.data.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.data.map((post) => <PostCard key={post.id} post={post} />)}
                  </div>
                )}

                {posts.data.length === 0 && posts.meta.total > 0 && (
                  <div className="card p-8 text-center">
                    <h2 className="text-xl">That page does not exist</h2>
                    <p className="mt-2 text-ink-600">There are fewer articles than that.</p>
                    <Link to={articlesUrl({ category, search })} className="btn btn-primary mt-5">Go to the first page</Link>
                  </div>
                )}

                {posts.meta.total === 0 && (
                  <div className="card p-8 text-center">
                    <h2 className="text-xl">{filtering ? 'No articles match your search' : 'No articles yet'}</h2>
                    <p className="mt-2 text-ink-600">
                      {filtering
                        ? 'Try different words or remove the filters.'
                        : 'New articles will appear here once they are published.'}
                    </p>
                    {filtering && <Link to="/articles" className="btn btn-primary mt-5">Clear search and filters</Link>}
                  </div>
                )}

                <Pagination
                  page={page}
                  totalPages={posts.meta.totalPages}
                  buildTo={(n) => articlesUrl({ category, search, page: n })}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}