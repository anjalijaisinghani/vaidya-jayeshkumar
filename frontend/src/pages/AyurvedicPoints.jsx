import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'
import SectionPlaceholder from '../components/SectionPlaceholder.jsx'

export default function AyurvedicPoints() {
  return (
    <>
      <Seo title="Ayurvedic Points" />
      <PageHeader eyebrow="Ayurvedic Points" title="Ayurvedic points">
        Short, practical Ayurvedic points and tips.
      </PageHeader>
      <section className="section">
        <div className="container-page">
          <SectionPlaceholder title="Points coming soon">
            Ayurvedic points will appear here once they are published.
          </SectionPlaceholder>
        </div>
      </section>
    </>
  )
}