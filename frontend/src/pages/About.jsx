import { Link } from 'react-router'
import emblem from '../assets/emblem.webp'
import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'
import { useProfile } from '../context/useProfile.js'

export default function About() {
  const { status, profile } = useProfile()
  const facts = [
    ['Specialization', profile?.specialization],
    ['Experience', profile?.experience],
  ].filter(([, value]) => value)
  const hasDetails = Boolean(profile && (facts.length || profile.qualifications || profile.about))

  return (
    <>
      <Seo title="About" description="About Vaidya Jayeshkumar, Ayurvedic doctor." />
      <PageHeader eyebrow="About" title={profile?.doctor_name || 'About the doctor'} />
      <section className="section">
        <div className="container-page">
          {status === 'loading' && (
            <div className="space-y-2" aria-hidden="true">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
          )}

          {status === 'error' && (
            <p className="alert alert-error" role="alert">
              The doctor's profile could not be loaded. Please try again later.
            </p>
          )}

          {status === 'ready' && profile && (
            <div className="grid gap-10 md:grid-cols-[16rem_1fr] lg:grid-cols-[20rem_1fr]">
              <div>
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={`Portrait of ${profile.doctor_name}`}
                    className="aspect-[4/5] w-full max-w-xs rounded-2xl object-cover md:max-w-none"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full max-w-xs items-center justify-center rounded-2xl bg-leaf-100 md:max-w-none">
                    <img src={emblem} alt="" width="192" height="190" className="h-28 w-auto opacity-50" />
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {facts.length > 0 && (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {facts.map(([label, value]) => (
                      <div key={label} className="card p-5">
                        <dt className="text-xs font-semibold tracking-wide text-earth-700 uppercase">{label}</dt>
                        <dd className="mt-1 text-lg">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {profile.qualifications && (
                  <div>
                    <h2 className="text-2xl">Qualifications</h2>
                    <p className="mt-3 text-lg leading-relaxed whitespace-pre-line">{profile.qualifications}</p>
                  </div>
                )}

                {profile.about && (
                  <div>
                    <h2 className="text-2xl">About</h2>
                    <p className="mt-3 text-lg leading-relaxed whitespace-pre-line">{profile.about}</p>
                  </div>
                )}

                {!hasDetails && (
                  <SectionPlaceholder title="Profile coming soon">
                    The doctor's introduction will appear here.
                  </SectionPlaceholder>
                )}

                <p>
                  <Link to="/contact" className="btn btn-primary">Contact the doctor</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}