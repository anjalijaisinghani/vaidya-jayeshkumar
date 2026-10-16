import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'
import { useProfile } from '../context/useProfile.js'
import { mailtoHref, telHref, whatsappHref } from '../lib/contact.js'

function Item({ label, children }) {
  return (
    <div className="card p-6">
      <h2 className="font-sans text-xs font-semibold tracking-wide text-earth-700 uppercase">{label}</h2>
      <div className="mt-2 space-y-4">{children}</div>
    </div>
  )
}

export default function Contact() {
  const { status, profile } = useProfile()
  const hasContact = Boolean(
    profile && (profile.phone || profile.whatsapp || profile.email || profile.address || profile.timings || profile.map_url),
  )

  return (
    <>
      <Seo title="Contact" description="Contact details and clinic timings of Vaidya Jayeshkumar." />
      <PageHeader eyebrow="Contact" title="Get in touch" />
      <section className="section">
        <div className="container-page max-w-4xl">
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
            <div className="grid gap-6 sm:grid-cols-2">
              {profile.phone && (
                <Item label="Phone">
                  <p className="text-xl font-medium">{profile.phone}</p>
                  <a href={telHref(profile.phone)} className="btn btn-primary btn-sm">Call now</a>
                </Item>
              )}

              {profile.whatsapp && (
                <Item label="WhatsApp">
                  <p className="text-xl font-medium">{profile.whatsapp}</p>
                  <a
                    href={whatsappHref(profile.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-earth btn-sm"
                  >
                    Chat on WhatsApp
                  </a>
                </Item>
              )}

              {profile.email && (
                <Item label="Email">
                  <p className="text-lg break-words">{profile.email}</p>
                  <a href={mailtoHref(profile.email)} className="btn btn-secondary btn-sm">Send an email</a>
                </Item>
              )}

              {(profile.address || profile.map_url) && (
                <Item label="Clinic address">
                  {profile.address && <p className="text-lg whitespace-pre-line">{profile.address}</p>}
                  {profile.map_url && (
                    <a
                      href={profile.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View on map
                    </a>
                  )}
                </Item>
              )}

              {profile.timings && (
                <Item label="Clinic timings">
                  <p className="text-lg whitespace-pre-line">{profile.timings}</p>
                </Item>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}