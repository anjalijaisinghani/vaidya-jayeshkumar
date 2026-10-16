import { useEffect } from 'react'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site.js'

// Sets the browser tab title (and optionally the description) for the current page.
export default function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_TAGLINE}`
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
  }, [title, description])

  return null
}