import { Link } from 'react-router'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <section className="section">
        <div className="container-page max-w-xl text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-earth-700 uppercase">Error 404</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-lg text-ink-600">
            Sorry, we could not find the page you were looking for. It may have been moved or the
            address may be mistyped.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn btn-primary">Go to the home page</Link>
            <Link to="/articles" className="btn btn-secondary">Browse articles</Link>
          </div>
        </div>
      </section>
    </>
  )
}