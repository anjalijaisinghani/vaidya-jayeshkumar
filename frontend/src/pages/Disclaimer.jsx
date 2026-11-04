import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import Seo from '../components/Seo.jsx'

// DRAFT wording. It must be read and approved by the doctor before the website goes live, and ideally
// checked by someone who knows the rules for medical websites in India. Edit the text below as needed.
const SECTIONS = [
  {
    title: 'For general information only',
    content: (
      <p>
        The articles, treatment descriptions and Ayurvedic points on this website are shared for general education
        and information. They are not individual medical advice, a diagnosis or a prescription, and they do not
        replace a consultation with a qualified healthcare professional.
      </p>
    ),
  },
  {
    title: 'No promises or guarantees',
    content: (
      <p>
        People respond differently to any treatment, including Ayurvedic care. Nothing on this website promises or
        guarantees a cure or a particular result.
      </p>
    ),
  },
  {
    title: 'Speak to a professional before you act',
    content: (
      <p>
        Please do not start, stop or change any treatment, medicine, herb, diet or dose because of something you
        have read here without first speaking to a qualified practitioner. This is especially important if you are
        pregnant or breastfeeding, have a long-term health condition, take other medicines, or are caring for a child.
      </p>
    ),
  },
  {
    title: 'Emergencies',
    content: (
      <p>
        This website is not for emergencies. If you think you or someone else may be seriously unwell, contact your
        local emergency services or go to the nearest hospital straight away.
      </p>
    ),
  },
  {
    title: 'Accuracy of the information',
    content: (
      <p>
        We take care to keep the information accurate and up to date, but we cannot guarantee that it is complete or
        current. Knowledge and recommendations in health care change over time.
      </p>
    ),
  },
  {
    title: 'Links to other websites',
    content: (
      <p>
        Some articles may link to other websites. We do not control those websites and are not responsible for what
        they contain.
      </p>
    ),
  },
  {
    title: 'Questions',
    content: (
      <p>
        If you have a question about this disclaimer, please get in touch using the details on the{' '}
        <Link to="/contact">Contact page</Link>.
      </p>
    ),
  },
]

export default function Disclaimer() {
  return (
    <>
      <Seo title="Disclaimer" description="Important information about how to use the health information on this website." />
      <PageHeader eyebrow="Disclaimer" title="Disclaimer">
        Please read before relying on information on this website.
      </PageHeader>
      <section className="section">
        <div className="container-page max-w-3xl space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title} aria-labelledby={`disclaimer-${section.title}`.replace(/\W+/g, '-').toLowerCase()}>
              <h2 id={`disclaimer-${section.title}`.replace(/\W+/g, '-').toLowerCase()} className="text-2xl">
                {section.title}
              </h2>
              <div className="mt-3 text-lg leading-relaxed text-ink-700">{section.content}</div>
            </section>
          ))}
        </div>
      </section>
    </>
  )
}