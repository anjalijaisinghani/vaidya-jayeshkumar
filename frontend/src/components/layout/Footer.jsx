import { Link } from 'react-router'
import { useProfile } from '../../context/useProfile.js'
import { CREDIT, LEGAL_ITEMS, NAV_ITEMS, SITE_NAME, SITE_TAGLINE } from '../../lib/site.js'

const footerLink = 'text-leaf-100 no-underline hover:text-white hover:underline'
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { profile } = useProfile()
  const hasContact = profile && (profile.phone || profile.email || profile.address || profile.timings)

  return (
    <footer className="bg-leaf-900 text-cream-100">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold text-white">{SITE_NAME}</p>
          <p className="mt-1 text-xs font-medium tracking-[0.18em] text-leaf-200 uppercase">{SITE_TAGLINE}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold tracking-wide text-leaf-200 uppercase">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={footerLink}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {hasContact && (
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-leaf-200 uppercase">Contact</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {profile.phone && (
                <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className={footerLink}>{profile.phone}</a></li>
              )}
              {profile.email && (
                <li><a href={`mailto:${profile.email}`} className={footerLink}>{profile.email}</a></li>
              )}
              {profile.address && <li className="whitespace-pre-line text-leaf-100">{profile.address}</li>}
              {profile.timings && <li className="whitespace-pre-line text-leaf-100">{profile.timings}</li>}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-leaf-200 uppercase">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={footerLink}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-page space-y-3 py-6 text-sm text-leaf-200">
          <p>
            The information on this website is for general education and does not replace advice
            from a qualified healthcare professional. See our{' '}
            <Link to="/disclaimer" className="text-leaf-100 underline hover:text-white">disclaimer</Link>.
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {CURRENT_YEAR} {SITE_NAME}. All rights reserved.</p>
            <p>{CREDIT}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}