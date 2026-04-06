'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const faqs = [
  {
    question: 'How do I reserve a vehicle?',
    answer: 'Choose whether you want a traditional rental or a car sharing trip, run a search, review the detail page, and continue into the live Ride Fleet checkout flow.'
  },
  {
    question: 'Do you offer airport pickup?',
    answer: 'Yes. The new site experience keeps airport-oriented pickup messaging front and center while the actual reservation and operational workflow stays inside Ride Fleet.'
  },
  {
    question: 'Can I save my card and handle deposits digitally?',
    answer: 'Yes. The booking and payment flow uses the Ride Fleet plus Authorize.Net setup already handling hosted payments, saved cards, and security deposit holds.'
  },
  {
    question: 'What is the difference between rentals and car sharing?',
    answer: 'Rentals are class-based and inventory-driven. Car sharing is listing-based and merchandised more like a marketplace. Both still resolve into the same booking backbone.'
  },
  {
    question: 'Can I book outside normal office hours?',
    answer: 'Yes, if the location allows after-hours reservations and pickup rules are configured for that branch. The public website should communicate those rules before the guest commits.'
  },
  {
    question: 'What documents should I have ready?',
    answer: 'Guests should expect to complete customer information, review the agreement, and provide any required ID or license details in the portal before pickup.'
  },
  {
    question: 'How will the new website launch?',
    answer: 'The recommended rollout is to soft-launch the new storefront first, validate the real guest journey, and then move the main domain over once checkout and payment flows are fully proven.'
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
  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Guest FAQ</span>
        <h1 style={{ marginTop: 8 }}>Answer the guest questions before they become support tickets</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          The current site already hints at convenience, airport pickup, and affordability. The new FAQ should support that message while clarifying how rentals, car sharing, payments, and pickup actually work.
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
            <span className="eyebrow">Rollout Recommendation</span>
            <h2 style={{ margin: 0 }}>Launch this FAQ with the new storefront</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Launch the new FAQ with the new booking lanes so support can validate the language before the main domain switch.
            </p>
          </div>
          <Link href={withSiteBase(basePath, '/become-a-host')} className="button-subtle" style={{ textDecoration: 'none' }}>
            Host onboarding
          </Link>
        </div>
      </section>
    </div>
  );
}
