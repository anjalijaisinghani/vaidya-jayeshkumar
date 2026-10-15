import { useState } from 'react'
import logo from '../assets/logo.webp'
import emblem from '../assets/emblem.webp'
import ApiStatus from '../components/ApiStatus.jsx'

const leafScale = [
  ['50', 'bg-leaf-50'], ['100', 'bg-leaf-100'], ['200', 'bg-leaf-200'], ['300', 'bg-leaf-300'],
  ['400', 'bg-leaf-400'], ['500', 'bg-leaf-500'], ['600', 'bg-leaf-600'], ['700', 'bg-leaf-700'],
  ['800', 'bg-leaf-800'], ['900', 'bg-leaf-900'],
]
const earthScale = [
  ['50', 'bg-earth-50'], ['100', 'bg-earth-100'], ['200', 'bg-earth-200'], ['300', 'bg-earth-300'],
  ['400', 'bg-earth-400'], ['500', 'bg-earth-500'], ['600', 'bg-earth-600'], ['700', 'bg-earth-700'],
  ['800', 'bg-earth-800'], ['900', 'bg-earth-900'],
]
const creamScale = [
  ['50', 'bg-cream-50'], ['100', 'bg-cream-100'], ['200', 'bg-cream-200'], ['300', 'bg-cream-300'],
]

function Swatches({ title, items }) {
  return (
    <div>
      <h3 className="mb-3 text-lg">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map(([name, className]) => (
          <div key={name} className="w-16 text-center">
            <div className={`h-12 w-16 rounded-lg border border-cream-300 ${className}`} />
            <span className="mt-1 block text-xs text-ink-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Block({ title, children }) {
  return (
    <section className="py-8">
      <h2 className="mb-6 border-b border-cream-300 pb-3 text-2xl">{title}</h2>
      {children}
    </section>
  )
}

export default function StyleGuide() {
  const [email, setEmail] = useState('')
  const emailInvalid = email !== '' && !email.includes('@')

  return (
    <main className="container-page py-10">
      <header className="flex flex-wrap items-center gap-4">
        <img src={emblem} width="192" height="190" alt="" className="h-16 w-auto" />
        <div>
          <p className="font-serif text-2xl font-semibold text-leaf-800">Vaidya</p>
          <p className="font-serif text-2xl font-semibold text-earth-700">Jayeshkumar</p>
        </div>
        <p className="ml-auto text-sm text-ink-600">Design system preview (development only)</p>
      </header>

      <Block title="Backend connection">
        <ApiStatus />
      </Block>

      <Block title="Logo">
        <img
          src={logo}
          width="640"
          height="792"
          alt="Vaidya Jayeshkumar - Ayurvedic Treatment logo"
          className="h-auto w-72 max-w-full"
        />
      </Block>

      <Block title="Colors">
        <div className="space-y-6">
          <Swatches title="Leaf green (primary)" items={leafScale} />
          <Swatches title="Earth brown (accent)" items={earthScale} />
          <Swatches title="Cream (backgrounds)" items={creamScale} />
        </div>
      </Block>

      <Block title="Typography">
        <h1 className="text-4xl sm:text-5xl">Heading 1: Ayurvedic wellness</h1>
        <h2 className="mt-4 text-3xl">Heading 2: Treatments and care</h2>
        <h3 className="mt-4 text-xl">Heading 3: Daily routine</h3>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">
          Body text uses a clean sans-serif for easy reading on phones and desktops. This sample
          paragraph is placeholder text for checking size, spacing and line length.
        </p>
        <p className="mt-3 max-w-2xl text-ink-600">
          Muted text is used for dates, captions and supporting details.{' '}
          <a href="#links" className="underline hover:text-leaf-900">This is a link.</a>
        </p>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary">Primary</button>
          <button type="button" className="btn btn-secondary">Secondary</button>
          <button type="button" className="btn btn-earth">Accent</button>
          <button type="button" className="btn btn-danger">Delete</button>
          <button type="button" className="btn btn-primary" disabled>Disabled</button>
          <button type="button" className="btn btn-primary btn-sm">Small</button>
        </div>
      </Block>

      <Block title="Form fields">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sg-name" className="field-label">Name</label>
            <input id="sg-name" type="text" className="field-input" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="sg-email" className="field-label">Email (type text without @ to see the error)</label>
            <input
              id="sg-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`field-input ${emailInvalid ? 'field-input-error' : ''}`}
              aria-invalid={emailInvalid}
              aria-describedby="sg-email-msg"
              placeholder="name@example.com"
            />
            <p id="sg-email-msg" className={emailInvalid ? 'field-error' : 'field-hint'}>
              {emailInvalid ? 'Enter a valid email address.' : 'We never share your email.'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sg-msg" className="field-label">Message</label>
            <textarea id="sg-msg" rows="3" className="field-input" placeholder="Write here..." />
          </div>
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <article key={n} className="card card-hover overflow-hidden">
              <div className="aspect-[16/10] bg-leaf-100" />
              <div className="p-5">
                <p className="text-xs font-semibold tracking-wide text-earth-700 uppercase">Ayurvedic Points</p>
                <h3 className="mt-1 text-xl">Sample article title {n}</h3>
                <p className="mt-2 text-sm text-ink-600">A short excerpt appears here so visitors know what the article covers.</p>
              </div>
            </article>
          ))}
        </div>
      </Block>

      <Block title="States: success, error, info, loading, empty">
        <div className="grid max-w-3xl gap-4">
          <p className="alert alert-success" role="status">Success: your changes were saved.</p>
          <p className="alert alert-error" role="alert">Error: something went wrong. Please try again.</p>
          <p className="alert alert-info" role="note">
            Medical disclaimer: this website shares general Ayurvedic information and does not
            replace a consultation.
          </p>
          <div className="flex items-center gap-3 text-sm text-ink-600" role="status">
            <span className="spinner" aria-hidden="true" /> Loading...
          </div>
          <div className="space-y-2" aria-hidden="true">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="card p-8 text-center">
            <h3 className="text-xl">No articles yet</h3>
            <p className="mt-2 text-ink-600">New articles will appear here once they are published.</p>
          </div>
        </div>
      </Block>
    </main>
  )
}