import { Link } from 'react-router'

const base = 'btn btn-secondary btn-sm'

// buildTo(pageNumber) must return the address for that page.
export default function Pagination({ page, totalPages, buildTo }) {
  if (totalPages <= 1) return null
  const toTop = () => window.scrollTo(0, 0)

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link to={buildTo(page - 1)} rel="prev" onClick={toTop} className={base}>Previous</Link>
      ) : (
        <span className={`${base} pointer-events-none opacity-50`} aria-disabled="true">Previous</span>
      )}
      <p className="text-sm text-ink-600" aria-current="page">Page {page} of {totalPages}</p>
      {page < totalPages ? (
        <Link to={buildTo(page + 1)} rel="next" onClick={toTop} className={base}>Next</Link>
      ) : (
        <span className={`${base} pointer-events-none opacity-50`} aria-disabled="true">Next</span>
      )}
    </nav>
  )
}