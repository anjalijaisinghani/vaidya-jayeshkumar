// Site-wide constants, so names and links are defined in one place.

export const SITE_NAME = 'Vaidya Jayeshkumar'
export const SITE_TAGLINE = 'Ayurvedic Treatment'
export const CREDIT = 'Designed & Developed by Anjali Jaisinghani'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/articles', label: 'Articles' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/ayurvedic-points', label: 'Ayurvedic Points' },
  { to: '/contact', label: 'Contact' },
]

export const LEGAL_ITEMS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
]

// Two categories have their own pages (the backend protects them from deletion).
const CATEGORY_PAGES = {
  'ayurvedic-treatments': { listTo: '/treatments', backTo: '/treatments', backLabel: 'All treatments' },
  'ayurvedic-points': { listTo: '/ayurvedic-points', backTo: '/ayurvedic-points', backLabel: 'All Ayurvedic points' },
}

// Where should "see more like this" links for an article's category point?
export function listPageFor(categorySlug) {
  return (
    CATEGORY_PAGES[categorySlug] ?? {
      listTo: categorySlug ? `/articles?category=${encodeURIComponent(categorySlug)}` : '/articles',
      backTo: '/articles',
      backLabel: 'All articles',
    }
  )
}