import { Link } from 'react-router'
import { useApi } from '../hooks/useApi.js'

const chipBase = 'rounded-full border px-4 py-2 text-sm font-medium no-underline transition-colors'
const chipIdle = 'border-cream-300 bg-white text-ink-700 hover:border-leaf-600 hover:text-leaf-900'
const chipActive = 'border-leaf-800 bg-leaf-800 text-white'

// Row of category filter buttons. buildTo({ category }) returns the address for a category.
export default function CategoryChips({ category, buildTo }) {
  const categories = useApi('/categories')
  if (categories.status !== 'ready') return null

  const used = categories.data.filter((c) => c.post_count > 0)
  if (used.length === 0) return null

  return (
    <nav aria-label="Categories">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to={buildTo('')}
            aria-current={category ? undefined : 'true'}
            className={`${chipBase} ${category ? chipIdle : chipActive}`}
          >
            All
          </Link>
        </li>
        {used.map((c) => (
          <li key={c.id}>
            <Link
              to={buildTo(c.slug)}
              aria-current={category === c.slug ? 'true' : undefined}
              className={`${chipBase} ${category === c.slug ? chipActive : chipIdle}`}
            >
              {c.name} <span className="opacity-80">({c.post_count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}