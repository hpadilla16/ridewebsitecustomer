'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

export default function TermsPage() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  const sections = [
    {
      title: t('termsPage.sections.acceptance.title'),
      body: t('termsPage.sections.acceptance.body')
    },
    {
      title: t('termsPage.sections.eligibility.title'),
      body: t('termsPage.sections.eligibility.body')
    },
    {
      title: t('termsPage.sections.booking.title'),
      body: t('termsPage.sections.booking.body')
    },
    {
      title: t('termsPage.sections.cancellation.title'),
      body: t('termsPage.sections.cancellation.body')
    },
    {
      title: t('termsPage.sections.payment.title'),
      body: t('termsPage.sections.payment.body')
    },
    {
      title: t('termsPage.sections.vehicleUse.title'),
      body: t('termsPage.sections.vehicleUse.body')
    },
    {
      title: t('termsPage.sections.insurance.title'),
      body: t('termsPage.sections.insurance.body')
    },
    {
      title: t('termsPage.sections.hostResponsibilities.title'),
      body: t('termsPage.sections.hostResponsibilities.body')
    },
    {
      title: t('termsPage.sections.disputeResolution.title'),
      body: t('termsPage.sections.disputeResolution.body')
    },
    {
      title: t('termsPage.sections.liability.title'),
      body: t('termsPage.sections.liability.body')
    },
    {
      title: t('termsPage.sections.privacy.title'),
      body: t('termsPage.sections.privacy.body')
    },
    {
      title: t('termsPage.sections.changes.title'),
      body: t('termsPage.sections.changes.body')
    },
    {
      title: t('termsPage.sections.contact.title'),
      body: t('termsPage.sections.contact.body')
    }
  ];

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">{t('termsPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8 }}>{t('termsPage.heading')}</h1>
        <p className="ui-muted">{t('termsPage.lastUpdated')}</p>
      </section>

      {sections.map((section, idx) => (
        <section key={idx} className="glass card" style={{ padding: '22px 24px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#1e2847' }}>{section.title}</h2>
          <p style={{ margin: 0, color: '#53607b', lineHeight: 1.7, fontSize: '0.92rem' }}>{section.body}</p>
        </section>
      ))}

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href={withSiteBase(basePath, '/privacy')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>{t('termsPage.privacyPolicy')}</Link>
        <Link href={withSiteBase(basePath, '/contact')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>{t('termsPage.contactUs')}</Link>
      </div>
    </div>
  );
}
