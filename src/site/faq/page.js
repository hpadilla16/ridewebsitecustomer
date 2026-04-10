'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const faqs = [
  {
    question: 'How do I reserve a vehicle?',
    answer: 'Choose whether you want a traditional rental or a car sharing trip, search for available vehicles, review pricing on the detail page, and complete your reservation through checkout.'
  },
  {
    question: 'Do you offer airport pickup?',
    answer: 'Yes. Our airport pickup locations have clear staging instructions, shuttle details, and digital readiness so you know exactly where to go when you land.'
  },
  {
    question: 'Can I save my card and handle deposits digitally?',
    answer: 'Yes. Our payment flow supports hosted payments, saved cards, and security deposit holds through our secure payment partner.'
  },
  {
    question: 'What is the difference between rentals and car sharing?',
    answer: 'Rentals are class-based — you pick a vehicle category and we assign the best available car. Car sharing is listing-based — you browse specific vehicles from verified local hosts, similar to a marketplace.'
  },
  {
    question: 'Can I book outside normal office hours?',
    answer: 'Yes, depending on the pickup location. After-hours availability and pickup instructions are shown on each location page before you book.'
  },
  {
    question: 'What documents should I have ready?',
    answer: 'You will need a valid driver\'s license, a credit or debit card, and to complete your customer information and rental agreement digitally before pickup.'
  },
  {
    question: 'What happens if I need to cancel?',
    answer: 'Cancellations made 24-48 hours before pickup are free depending on the booking type. Late cancellations may incur a fee. Full details are shown at checkout.'
  }
];

const faqThemes = [
  {
    title: 'Booking confidence',
    body: 'Answer pricing, due-now, and location questions before a guest abandons the flow.'
  },
  {
    title: 'Arrival readiness',
    body: 'Use the FAQ to explain airport pickup, after-hours reservations, and the customer portal steps before pickup.'
  },
  {
    title: 'Marketplace clarity',
    body: 'Differentiate car sharing from traditional rentals without splitting the brand into two disconnected websites.'
  }
];

export default function FaqPreviewPage() {
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Guest FAQ</span>
        <h1 style={{ marginTop: 8 }}>Frequently Asked Questions</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          Everything you need to know about rentals, car sharing, payments, airport pickup, and your booking experience.
        </p>
        <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            Start rental search
          </Link>
          <Link href={withSiteBase(basePath, '/contact')} className="button-subtle" style={{ textDecoration: 'none' }}>
            Open support page
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
        {faqThemes.map((theme) => (
          <article key={theme.title} className="glass card" style={{ padding: 22 }}>
            <div className="label">FAQ Theme</div>
            <h3 style={{ margin: '8px 0 10px' }}>{theme.title}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{theme.body}</p>
          </article>
        ))}
      </section>

      <section className="stack" style={{ gap: 14 }}>
        {faqs.map((item) => (
          <article key={item.question} className="glass card" style={{ padding: 22 }}>
            <div className="label">Guest Question</div>
            <h3 style={{ margin: '8px 0 10px' }}>{item.question}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="glass card-lg" style={{ padding: 28 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <span className="eyebrow">Ready to get started?</span>
            <h2 style={{ margin: 0 }}>Book your ride or become a host today</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={withSiteBase(basePath, '/rent')} className="button-subtle" style={{ textDecoration: 'none' }}>
              Rent a car
            </Link>
            <Link href={withSiteBase(basePath, '/become-a-host')} className="button-subtle" style={{ textDecoration: 'none' }}>
              Become a host
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
