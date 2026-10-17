import { useEffect } from 'react'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site.js'

// Sets the browser tab title (and optionally the description) for the current page.
// noindex: asks search engines not to list the page (used for the admin panel).
export default function Seo({ title, description, noindex = false }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_TAGLINE}`
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
  }, [title, description])

  useEffect(() => {
    if (!noindex) return undefined
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [noindex])

  return null
}