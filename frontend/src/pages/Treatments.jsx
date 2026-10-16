import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'

export default function Treatments() {
  return (
    <>
      <Seo title="Treatments" />
      <PageHeader eyebrow="Treatments" title="Ayurvedic treatments">
        Information about Ayurvedic treatments.
      </PageHeader>
      <section className="section">
        <div className="container-page">
          <SectionPlaceholder title="Treatments coming soon">
            Treatment information will appear here once it is published.
          </SectionPlaceholder>
        </div>
      </section>
    </>
  )
}