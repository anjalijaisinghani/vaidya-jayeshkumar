import PageHeader from '../components/PageHeader.jsx'
import PostBrowser from '../components/PostBrowser.jsx'
import Seo from '../components/Seo.jsx'

export default function AyurvedicPoints() {
  return (
    <>
      <Seo title="Ayurvedic Points" description="Ayurvedic points and tips from Vaidya Jayeshkumar." />
      <PageHeader eyebrow="Ayurvedic Points" title="Ayurvedic points">
        Short, practical Ayurvedic points and tips.
      </PageHeader>
      <PostBrowser
        basePath="/ayurvedic-points"
        fixedCategory="ayurvedic-points"
        noun={{ singular: 'point', plural: 'points' }}
        searchLabel="Search Ayurvedic points"
        emptyTitle="No Ayurvedic points yet"
        emptyText="Ayurvedic points will appear here once they are published."
      />
    </>
  )
}