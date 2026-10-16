// The title band at the top of every inner page.
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="border-b border-cream-300 bg-leaf-50">
      <div className="container-page py-12 sm:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.18em] text-earth-700 uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
        {children && <p className="mt-4 max-w-2xl text-lg text-ink-600">{children}</p>}
      </div>
    </div>
  )
}