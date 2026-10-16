import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'

export default function Privacy() {
  return (
    <>
      <Seo title="Privacy Policy" />
      <PageHeader eyebrow="Privacy Policy" title="Privacy Policy">
        How this website handles personal information.
      </PageHeader>
      <section className="section">
        <div className="container-page">
          <SectionPlaceholder title="Policy being prepared">
            The privacy policy text will be provided and approved by the doctor.
          </SectionPlaceholder>
        </div>
      </section>
    </>
  )
}