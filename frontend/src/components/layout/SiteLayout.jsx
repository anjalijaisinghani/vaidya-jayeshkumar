import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const previousPath = useRef(pathname)

  // After moving to another page: scroll to the top and move keyboard/screen-reader
  // focus to the page content. Does nothing on the very first load.
  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-leaf-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}