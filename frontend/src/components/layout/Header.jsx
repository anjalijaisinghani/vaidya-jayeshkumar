import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import emblem from '../../assets/emblem.webp'
import { NAV_ITEMS, SITE_NAME, SITE_TAGLINE } from '../../lib/site.js'

const linkClass = ({ isActive }) =>
  `block rounded-full px-4 py-3 text-base font-medium no-underline transition-colors lg:px-3 lg:py-2 lg:text-sm ${
    isActive
      ? 'bg-leaf-100 text-leaf-900'
      : 'text-ink-700 hover:bg-leaf-50 hover:text-leaf-900'
  }`

export default function Header() {
  const { pathname } = useLocation()
  // The menu is "open" only for the page it was opened on, so it closes by itself
  // whenever the visitor goes to another page (links, back button, etc.).
  const [openPath, setOpenPath] = useState(null)
  const open = openPath === pathname

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="flex items-center gap-3 no-underline" aria-label={`${SITE_NAME} - home`}>
          <img src={emblem} width="192" height="190" alt="" className="h-11 w-auto lg:h-14" />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold text-leaf-800 lg:text-xl">
              {SITE_NAME}
            </span>
            <span className="block text-[0.7rem] font-medium tracking-[0.18em] text-earth-700 uppercase">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-leaf-800 hover:bg-leaf-50 lg:hidden"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav aria-label="Main">
          <ul
            id="main-menu"
            className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col gap-1 border-b border-cream-300 bg-cream-100 px-4 py-3 shadow-md lg:static lg:flex lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}