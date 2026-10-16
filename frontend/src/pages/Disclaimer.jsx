import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'

export default function Disclaimer() {
  return (
    <>
      <Seo title="Disclaimer" />
      <PageHeader eyebrow="Disclaimer" title="Disclaimer">
        Please read before relying on information on this website.
      </PageHeader>
      <section className="section">
        <div className="container-page">
          <SectionPlaceholder title="Disclaimer being prepared">
            The disclaimer text will be provided and approved by the doctor.
          </SectionPlaceholder>
        </div>
      </section>
    </>
  )
}