'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

export default function AboutPage() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  const stats = [
    { value: '5+', label: t('aboutPage.stats.citiesServed') },
    { value: '24/7', label: t('aboutPage.stats.onlineBooking') },
    { value: '2', label: t('aboutPage.stats.bookingLanes') },
    { value: '100%', label: t('aboutPage.stats.digitalHandoff') },
  ];

  const values = [
    {
      title: t('aboutPage.values.transparency.title'),
      body: t('aboutPage.values.transparency.body')
    },
    {
      title: t('aboutPage.values.airportReliability.title'),
      body: t('aboutPage.values.airportReliability.body')
    },
    {
      title: t('aboutPage.values.hostEmpowerment.title'),
      body: t('aboutPage.values.hostEmpowerment.body')
    },
    {
      title: t('aboutPage.values.guestConfidence.title'),
      body: t('aboutPage.values.guestConfidence.body')
    },
    {
      title: t('aboutPage.values.technology.title'),
      body: t('aboutPage.values.technology.body')
    }
  ];

  const locations = [
    { city: t('aboutPage.locations.sanJuan.city'), note: t('aboutPage.locations.sanJuan.note') },
    { city: t('aboutPage.locations.miami.city'), note: t('aboutPage.locations.miami.note') },
    { city: t('aboutPage.locations.orlando.city'), note: t('aboutPage.locations.orlando.note') },
    { city: t('aboutPage.locations.fortLauderdale.city'), note: t('aboutPage.locations.fortLauderdale.note') },
    { city: t('aboutPage.locations.losAngeles.city'), note: t('aboutPage.locations.losAngeles.note') },
    { city: t('aboutPage.locations.ecuador.city'), note: t('aboutPage.locations.ecuador.note') },
  ];

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero */}
      <section className="glass card-lg" style={{ padding: '36px 28px' }}>
        <span className="eyebrow">{t('aboutPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8, marginBottom: 12, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2847', lineHeight: 1.1 }}>
          {t('aboutPage.heroTitle')}
        </h1>
        <p className="ui-muted" style={{ maxWidth: 700, fontSize: '1rem', lineHeight: 1.7 }}>
          {t('aboutPage.heroSubtitle')}
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
        <h2 style={{ margin: '0 0 14px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>{t('aboutPage.ourStoryTitle')}</h2>
        <div style={{ color: '#53607b', lineHeight: 1.8, fontSize: '0.94rem', display: 'grid', gap: 12 }}>
          <p style={{ margin: 0 }}>
            {t('aboutPage.ourStoryP1')}
          </p>
          <p style={{ margin: 0 }}>
            {t('aboutPage.ourStoryP2')}
          </p>
          <p style={{ margin: 0 }}>
            {t('aboutPage.ourStoryP3')}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="glass card-lg" style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>{t('aboutPage.valuesTitle')}</h2>
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
        <h2 style={{ margin: '0 0 18px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>{t('aboutPage.locationsTitle')}</h2>
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
        <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: '#1e2847' }}>{t('aboutPage.ctaTitle')}</h2>
        <p className="ui-muted" style={{ marginBottom: 20 }}>{t('aboutPage.ctaSubtitle')}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/rent')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{t('aboutPage.browseRentals')}</Link>
          <Link href={withSiteBase(basePath, '/car-sharing')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff', fontWeight: 700, fontSize: '0.9rem' }}>{t('common.carSharing')}</Link>
          <Link href={withSiteBase(basePath, '/become-a-host')} style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff', fontWeight: 700, fontSize: '0.9rem' }}>{t('common.becomeAHost')}</Link>
        </div>
      </section>
    </div>
  );
}
