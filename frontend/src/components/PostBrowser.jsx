import { Link, useSearchParams } from 'react-router'
import { useApi } from '../hooks/useApi.js'
import CategoryChips from './CategoryChips.jsx'
import Pagination from './Pagination.jsx'
import PostCard, { PostCardSkeleton } from './PostCard.jsx'

const PAGE_SIZE = 9
const MAX_PAGE = 10000

// Search box + (optional) category chips + a page of article cards + pagination.
//   basePath:      the page this lives on, e.g. "/articles" or "/treatments"
//   fixedCategory: show only this category (no chips), e.g. "ayurvedic-treatments"
//   showCategories: show the category chips (used by the main Articles page)
export default function PostBrowser({
  basePath,
  fixedCategory = '',
  showCategories = false,
  noun = { singular: 'article', plural: 'articles' },
  searchLabel = 'Search articles',
  emptyTitle = 'No articles yet',
  emptyText = 'New articles will appear here once they are published.',
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = fixedCategory || (showCategories ? searchParams.get('category') || '' : '')
  const search = (searchParams.get('search') || '').trim().slice(0, 100)
  const page = Math.min(MAX_PAGE, Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1))
  const filtering = Boolean(search || (showCategories && category))

  // Address of this page with the given filters, e.g. /articles?category=blogs&page=2
  function urlFor({ category: cat, search: term, page: n }) {
    const params = new URLSearchParams()
    if (showCategories && cat) params.set('category', cat)
    if (term) params.set('search', term)
    if (n && n > 1) params.set('page', String(n))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  if (category) query.set('category', category)
  if (search) query.set('search', search)
  const posts = useApi(`/posts?${query.toString()}`)

  function onSearch(event) {
    event.preventDefault()
    const value = (new FormData(event.currentTarget).get('search') || '').toString().trim()
    const next = new URLSearchParams()
    if (showCategories && category) next.set('category', category)
    if (value) next.set('search', value)
    setSearchParams(next)
  }

  return (
    <section className="section">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <form role="search" onSubmit={onSearch} className="flex max-w-xl gap-2" key={search}>
            <label htmlFor="post-search" className="sr-only">{searchLabel}</label>
            <input
              id="post-search"
              name="search"
              type="search"
              maxLength={100}
              defaultValue={search}
              placeholder={`${searchLabel}...`}
              className="field-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {showCategories && (
            <CategoryChips category={category} buildTo={(cat) => urlFor({ category: cat, search })} />
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
                  ? `No ${noun.plural} found`
                  : `${posts.meta.total} ${posts.meta.total === 1 ? noun.singular : noun.plural}${filtering ? ' found' : ''}`}
              </p>

              {posts.data.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.data.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
              )}

              {posts.data.length === 0 && posts.meta.total > 0 && (
                <div className="card p-8 text-center">
                  <h2 className="text-xl">That page does not exist</h2>
                  <p className="mt-2 text-ink-600">There are fewer {noun.plural} than that.</p>
                  <Link to={urlFor({ category, search })} className="btn btn-primary mt-5">Go to the first page</Link>
                </div>
              )}

              {posts.meta.total === 0 && (
                <div className="card p-8 text-center">
                  <h2 className="text-xl">{filtering ? `No ${noun.plural} match your search` : emptyTitle}</h2>
                  <p className="mt-2 text-ink-600">
                    {filtering ? 'Try different words or remove the filters.' : emptyText}
                  </p>
                  {filtering && <Link to={basePath} className="btn btn-primary mt-5">Clear search and filters</Link>}
                </div>
              )}

              <Pagination
                page={page}
                totalPages={posts.meta.totalPages}
                buildTo={(n) => urlFor({ category, search, page: n })}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}