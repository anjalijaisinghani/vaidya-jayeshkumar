import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'
import { useProfile } from '../context/useProfile.js'

export default function About() {
  const { status, profile } = useProfile()

  return (
    <>
      <Seo title="About" />
      <PageHeader eyebrow="About" title={profile?.doctor_name || 'About the doctor'} />
      <section className="section">
        <div className="container-page max-w-3xl space-y-8">
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
            <>
              {profile.qualifications && (
                <div>
                  <h2 className="text-2xl">Qualifications</h2>
                  <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{profile.qualifications}</p>
                </div>
              )}
              {profile.about && (
                <div>
                  <h2 className="text-2xl">About</h2>
                  <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{profile.about}</p>
                </div>
              )}
              {!profile.qualifications && !profile.about && (
                <SectionPlaceholder title="Profile coming soon">
                  The doctor's introduction will appear here.
                </SectionPlaceholder>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}