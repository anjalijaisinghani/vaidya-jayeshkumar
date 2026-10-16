import PageHeader from '../components/PageHeader.jsx'
import PostBrowser from '../components/PostBrowser.jsx'
import Seo from '../components/Seo.jsx'

export default function Treatments() {
  return (
    <>
      <Seo title="Treatments" description="Information about Ayurvedic treatments from Vaidya Jayeshkumar." />
      <PageHeader eyebrow="Treatments" title="Ayurvedic treatments">
        Information about Ayurvedic treatments.
      </PageHeader>
      <PostBrowser
        basePath="/treatments"
        fixedCategory="ayurvedic-treatments"
        noun={{ singular: 'treatment', plural: 'treatments' }}
        searchLabel="Search treatments"
        emptyTitle="No treatments yet"
        emptyText="Treatment information will appear here once it is published."
      />
    </>
  )
}