import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'
import { useProfile } from '../context/useProfile.js'

export default function Contact() {
  const { status, profile } = useProfile()
  const hasContact = profile && (profile.phone || profile.email || profile.address || profile.timings)

  return (
    <>
      <Seo title="Contact" />
      <PageHeader eyebrow="Contact" title="Get in touch" />
      <section className="section">
        <div className="container-page max-w-3xl">
          {status === 'loading' && (
            <div className="space-y-2" aria-hidden="true">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}
          {status === 'error' && (
            <p className="alert alert-error" role="alert">
              Contact details could not be loaded. Please try again later.
            </p>
          )}
          {status === 'ready' && !hasContact && (
            <SectionPlaceholder title="Contact details coming soon">
              Phone, email, address and clinic timings will appear here.
            </SectionPlaceholder>
          )}
          {status === 'ready' && hasContact && (
            <dl className="card grid gap-6 p-6 sm:grid-cols-2">
              {profile.phone && (
                <div>
                  <dt className="text-sm font-semibold text-earth-700">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a>
                  </dd>
                </div>
              )}
              {profile.email && (
                <div>
                  <dt className="text-sm font-semibold text-earth-700">Email</dt>
                  <dd className="mt-1"><a href={`mailto:${profile.email}`}>{profile.email}</a></dd>
                </div>
              )}
              {profile.address && (
                <div>
                  <dt className="text-sm font-semibold text-earth-700">Address</dt>
                  <dd className="mt-1 whitespace-pre-line">{profile.address}</dd>
                </div>
              )}
              {profile.timings && (
                <div>
                  <dt className="text-sm font-semibold text-earth-700">Clinic timings</dt>
                  <dd className="mt-1 whitespace-pre-line">{profile.timings}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>
    </>
  )
}