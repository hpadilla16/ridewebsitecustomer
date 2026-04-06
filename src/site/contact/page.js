'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const contactCards = [
  {
    label: 'Reservations and Rentals',
    value: 'Guide guests into rental search, class selection, airport pickup questions, and reservation follow-up without sending them into ops screens.',
    action: { href: '/rent', label: 'Explore rentals' }
  },
  {
    label: 'Car Sharing Guests',
    value: 'Help marketplace-style guests browse listings, understand pickup expectations, and move confidently into checkout.',
    action: { href: '/car-sharing', label: 'Explore car sharing' }
  },
  {
    label: 'Hosts and Partners',
    value: 'Route host inquiries into a polished onboarding funnel instead of making partners hunt through the internal platform.',
    action: { href: '/become-a-host', label: 'Become a host' }
  }
];

const supportMoments = [
  'Need help choosing between a rental and a car sharing listing?',
  'Questions about airport pickup, return windows, or required documents?',
  'Need to finish payment, agreement, or customer portal steps after booking?'
];

const supportChannels = [
  {
    title: 'Before booking',
    body: 'Use the storefront lanes to compare classes, browse listings, and understand what is due now before checkout.'
  },
  {
    title: 'After booking',
    body: 'Send guests into the payment, signature, and customer-information portal instead of bouncing them into internal tools.'
  },
  {
    title: 'Hosts and partnerships',
    body: 'Route owners, fleet partners, and marketplace prospects into the host onboarding flow instead of a generic inbox.'
  }
];

const serviceDetails = [
  {
    label: 'Airport and local pickup',
    value: 'Promote airport-friendly instructions, branch guidance, and digital readiness in the public site before a guest ever calls support.'
  },
  {
    label: 'Payments and deposits',
    value: 'Use the guest portal for payment requests, hosted card capture, and security deposit communication instead of handling these steps manually.'
  },
  {
    label: 'Trip help and extensions',
    value: 'Reserve the internal ops tools for exceptions while the public website handles the common questions with stronger self-service pages.'
  }
];

export default function ContactPreviewPage() {
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const cards = contactCards.map((card) => ({
    ...card,
    action: {
      ...card.action,
      href: card.action.href === '/become-a-host'
          ? withSiteBase(basePath, '/become-a-host')
          : withSiteBase(basePath, card.action.href)
    }
  }));
  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Contact and Support</span>
        <h1 style={{ marginTop: 8 }}>A support page that feels more concierge than contact form</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          The public site should separate guest support, host inquiries, and operational escalations without dumping everyone into the internal Ride Fleet UI. This page turns the current contact story into something clearer, warmer, and easier for guests to self-serve.
        </p>
        <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/faq')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            Read Guest FAQ
          </Link>
          <Link href={withSiteBase(basePath, '/become-a-host')} className="button-subtle" style={{ textDecoration: 'none' }}>
            Become a Host
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 18 }}>
        <div className="glass card" style={{ padding: 24 }}>
          <div className="label">Support Categories</div>
          <div className="stack" style={{ gap: 14, marginTop: 12 }}>
            {cards.map((card) => (
              <article key={card.label} className="surface-note" style={{ display: 'grid', gap: 10 }}>
                <strong>{card.label}</strong>
                <div className="ui-muted">{card.value}</div>
                <Link href={card.action.href} className="button-subtle" style={{ textDecoration: 'none', width: 'fit-content' }}>
                  {card.action.label}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="glass card" style={{ padding: 24 }}>
          <div className="label">When guests reach out</div>
          <h2 style={{ margin: '8px 0 10px' }}>Use this page to guide, not just collect a message</h2>
          <p className="ui-muted">
            The stronger version of this page combines contact details, self-service links, and clear paths back into the real booking journey.
          </p>
          <div className="stack" style={{ gap: 10 }}>
            {supportMoments.map((moment) => (
              <div key={moment} className="surface-note">{moment}</div>
            ))}
          </div>
          <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            <Link href={withSiteBase(basePath, '/checkout')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
              Open checkout
            </Link>
            <Link href={withSiteBase(basePath, '/faq')} className="button-subtle" style={{ textDecoration: 'none' }}>
              Read FAQ
            </Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {supportChannels.map((channel) => (
          <article key={channel.title} className="glass card" style={{ padding: 22 }}>
            <div className="label">Support Flow</div>
            <h3 style={{ margin: '8px 0 10px' }}>{channel.title}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{channel.body}</p>
          </article>
        ))}
      </section>

      <section className="glass card-lg" style={{ padding: 28 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <span className="eyebrow">Support Story</span>
            <h2 style={{ margin: 0 }}>Keep customer service tied to the website experience</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              The new public site should reduce random support calls by making the common steps obvious: browse, book, pay, sign, and prepare for pickup from one coherent guest journey.
            </p>
          </div>
          <Link href={withSiteBase(basePath, '/checkout')} className="button-subtle" style={{ textDecoration: 'none' }}>
            Open checkout handoff
          </Link>
        </div>
        <div className="metric-grid" style={{ marginTop: 18 }}>
          {serviceDetails.map((item) => (
            <div key={item.label} className="glass card" style={{ padding: 20 }}>
              <div className="label">{item.label}</div>
              <p className="ui-muted" style={{ margin: '10px 0 0' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
