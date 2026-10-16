// Temporary box shown where real content will be built in a later step.
export default function SectionPlaceholder({ title, children }) {
  return (
    <div className="card border-dashed p-8 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-ink-600">{children}</p>
    </div>
  )
}