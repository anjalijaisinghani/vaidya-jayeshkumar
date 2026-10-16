const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// "2026-10-15T08:30:00.000Z" -> "15 October 2026". Returns '' if the value is missing or invalid.
export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}