import { Link } from 'react-router'

export default function AdminNotFound() {
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <h1 className="text-3xl">Page not found</h1>
      <p className="mt-3 text-ink-600">This admin page does not exist.</p>
      <Link to="/admin" className="btn btn-primary mt-6">Back to the dashboard</Link>
    </div>
  )
}