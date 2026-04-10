'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const stats = [
  { value: '5+', label: 'Cities served' },
  { value: '24/7', label: 'Online booking' },
  { value: '2', label: 'Booking lanes' },
  { value: '100%', label: 'Digital handoff' },
];

const values = [
  {
    title: 'Transparency first',
    body: 'No hidden fees, no surprises at pickup. Every price, policy, and instruction is visible before you book.'
  },
  {
    title: 'Airport-grade reliability',
    body: 'We built our operations around airport arrivals — the most stressful moment of any rental. Clear pickup instructions, real-time chat with your host, and digital readiness before you land.'
  },
  {
    title: 'Host empowerment',
    body: 'We give vehicle owners the tools to run a professional car sharing business — earnings dashboards, trip management, guest communication, and full operational support.'
  },
  {
    title: 'Guest confidence',
    body: 'Trip protection on every booking, secure hosted payments, verified hosts, and a dedicated issue center if anything goes wrong.'
  },
  {
    title: 'Technology that works',
    body: 'Real-time availability, instant booking, in-trip chat with pickup coordination, automated reminders, and digital inspections — all from your browser, no app required.'
  }
];

const locations = [
  { city: 'San Juan, Puerto Rico', note: 'Airport arrivals and island-wide coverage' },
  { city: 'Miami, Florida', note: 'Leisure and business travel hub' },
  { city: 'Orlando, Florida', note: 'Family travel and theme park access' },
  { city: 'Fort Lauderdale, Florida', note: 'Cruise port and airport transitions' },
  { city: 'Los Angeles, California', note: 'West coast premium mobility' },
  { city: 'Ecuador', note: 'International expansion market' },
];

export default function AboutPage() {
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero */}
      <section className="glass card-lg" style={{ padding: '36px 28px' }}>
        <span className="eyebrow">About Ride Car Sharing</span>
        <h1 style={{ marginTop: 8, marginBottom: 12, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2847', lineHeight: 1.1 }}>
          We believe renting a car should feel as easy as booking a flight.
        </h1>
        <p className="ui-muted" style={{ maxWidth: 700, fontSize: '1rem', lineHeight: 1.7 }}>
          Ride Car Sharing combines traditional car rentals and peer-to-peer car sharing into one premium platform. We handle the operations — reservations, payments, inspections, agreements, and support — so guests and hosts can focus on the trip.
        </p>
      </section>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {stats.map((s) => (
          <div key={s.label} className="glass card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6e49ff' }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: '#6b7a9a', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <section className="glass card-lg" style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>Our story</h2>
        <div style={{ color: '#53607b', lineHeight: 1.8, fontSize: '0.94rem', display: 'grid', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Ride started with a simple observation: the car rental experience is broken. Hidden fees, confusing pickup instructions, unreliable availability, and zero communication between the people involved in the transaction.
          </p>
          <p style={{ margin: 0 }}>
            We built Ride to fix that. Our platform combines the reliability of a traditional rental operation with the flexibility of peer-to-peer car sharing — and wraps both in a digital experience designed for travelers who expect more.
          </p>
          <p style={{ margin: 0 }}>
            Every feature we build — from the real-time trip chat to the host earnings dashboard — is designed to create transparency, build trust, and make the car rental experience feel premium from search to return.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="glass card-lg" style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>What we stand for</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          {values.map((v) => (
            <div key={v.title} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{v.title}</h3>
              <p style={{ margin: 0, color: '#53607b', fontSize: '0.9rem', lineHeight: 1.6 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="glass card-lg" style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>Where we operate</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {locations.map((loc) => (
            <div key={loc.city} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.06)' }}>
              <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.95rem' }}>{loc.city}</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7a9a', marginTop: 2 }}>{loc.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass card-lg" style={{ padding: '28px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>Ready to ride?</h2>
        <p className="ui-muted" style={{ marginBottom: 20 }}>Book a rental, browse car sharing, or become a host today.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/rent')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Browse Rentals</Link>
          <Link href={withSiteBase(basePath, '/car-sharing')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff', fontWeight: 700, fontSize: '0.9rem' }}>Car Sharing</Link>
          <Link href={withSiteBase(basePath, '/become-a-host')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff', fontWeight: 700, fontSize: '0.9rem' }}>Become a Host</Link>
        </div>
      </section>
    </div>
  );
}
