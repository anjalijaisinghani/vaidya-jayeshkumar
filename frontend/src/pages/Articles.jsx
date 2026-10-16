import PageHeader from '../components/PageHeader.jsx'
import PostBrowser from '../components/PostBrowser.jsx'
import Seo from '../components/Seo.jsx'

export default function Articles() {
  return (
    <>
      <Seo title="Articles" description="Ayurvedic articles and blogs from Vaidya Jayeshkumar." />
      <PageHeader eyebrow="Articles" title="Articles">
        Ayurvedic articles and blogs from the doctor.
      </PageHeader>
      <PostBrowser basePath="/articles" showCategories />
    </>
  )
}