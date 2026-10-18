const styles = {
  PUBLISHED: 'bg-leaf-100 text-leaf-900',
  DRAFT: 'bg-earth-100 text-earth-800',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? 'bg-cream-200 text-ink-700'}`}>
      {status === 'PUBLISHED' ? 'Published' : 'Draft'}
    </span>
  )
}