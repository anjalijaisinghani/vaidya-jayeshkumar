import { Link } from 'react-router'
import logo from '../assets/logo.webp'
import PostRow from '../components/PostRow.jsx'
import Seo from '../components/Seo.jsx'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site.js'

export default function Home() {
  return (
    <>
      <Seo />
      <section className="bg-leaf-50">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-earth-700 uppercase">{SITE_TAGLINE}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl">{SITE_NAME}</h1>
            {/* Placeholder wording: the final introduction is written and approved by the doctor. */}
            <p className="mt-5 max-w-xl text-lg text-ink-600">
              Ayurvedic knowledge, treatments and wellness information.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/articles" className="btn btn-primary">Read articles</Link>
              <Link to="/contact" className="btn btn-secondary">Contact</Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src={logo}
              width="640"
              height="792"
              alt={`${SITE_NAME} - ${SITE_TAGLINE} logo`}
              className="h-auto w-64 max-w-full sm:w-80"
            />
          </div>
        </div>
      </section>

      {/* Each row appears only when it has something to show. */}
      <PostRow
        primary
        headingId="featured-heading"
        title="Featured articles"
        path="/posts/featured?limit=3"
        viewAllTo="/articles"
        viewAllLabel="View all articles"
      />
      <PostRow
        headingId="treatments-heading"
        title="Ayurvedic treatments"
        path="/posts?category=ayurvedic-treatments&limit=3"
        viewAllTo="/treatments"
        viewAllLabel="All treatments"
      />
      <PostRow
        headingId="points-heading"
        title="Ayurvedic points"
        path="/posts?category=ayurvedic-points&limit=3"
        viewAllTo="/ayurvedic-points"
        viewAllLabel="All Ayurvedic points"
      />
      <div className="pb-10 sm:pb-14" />
    </>
  )
}