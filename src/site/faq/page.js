'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

export default function FaqPreviewPage() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  const faqs = [
    {
      question: t('faqPage.faqs.reserve.question'),
      answer: t('faqPage.faqs.reserve.answer')
    },
    {
      question: t('faqPage.faqs.airportPickup.question'),
      answer: t('faqPage.faqs.airportPickup.answer')
    },
    {
      question: t('faqPage.faqs.cardDeposits.question'),
      answer: t('faqPage.faqs.cardDeposits.answer')
    },
    {
      question: t('faqPage.faqs.rentalVsSharing.question'),
      answer: t('faqPage.faqs.rentalVsSharing.answer')
    },
    {
      question: t('faqPage.faqs.afterHours.question'),
      answer: t('faqPage.faqs.afterHours.answer')
    },
    {
      question: t('faqPage.faqs.documents.question'),
      answer: t('faqPage.faqs.documents.answer')
    },
    {
      question: t('faqPage.faqs.cancellation.question'),
      answer: t('faqPage.faqs.cancellation.answer')
    }
  ];

  const faqThemes = [
    {
      title: t('faqPage.themes.bookingConfidence.title'),
      body: t('faqPage.themes.bookingConfidence.body')
    },
    {
      title: t('faqPage.themes.arrivalReadiness.title'),
      body: t('faqPage.themes.arrivalReadiness.body')
    },
    {
      title: t('faqPage.themes.marketplaceClarity.title'),
      body: t('faqPage.themes.marketplaceClarity.body')
    }
  ];

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
        <span className="eyebrow">{t('faqPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8 }}>{t('faqPage.heading')}</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          {t('faqPage.intro')}
        </p>
        <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            {t('faqPage.startRentalSearch')}
          </Link>
          <Link href={withSiteBase(basePath, '/contact')} className="button-subtle" style={{ textDecoration: 'none' }}>
            {t('faqPage.openSupportPage')}
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
        {faqThemes.map((theme) => (
          <article key={theme.title} className="glass card" style={{ padding: 22 }}>
            <div className="label">{t('faqPage.faqThemeLabel')}</div>
            <h3 style={{ margin: '8px 0 10px' }}>{theme.title}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{theme.body}</p>
          </article>
        ))}
      </section>

      <section className="stack" style={{ gap: 14 }}>
        {faqs.map((item) => (
          <article key={item.question} className="glass card" style={{ padding: 22 }}>
            <div className="label">{t('faqPage.guestQuestionLabel')}</div>
            <h3 style={{ margin: '8px 0 10px' }}>{item.question}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="glass card-lg" style={{ padding: 28 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <span className="eyebrow">{t('faqPage.readyToStart')}</span>
            <h2 style={{ margin: 0 }}>{t('faqPage.bookOrHost')}</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={withSiteBase(basePath, '/rent')} className="button-subtle" style={{ textDecoration: 'none' }}>
              {t('faqPage.rentACar')}
            </Link>
            <Link href={withSiteBase(basePath, '/become-a-host')} className="button-subtle" style={{ textDecoration: 'none' }}>
              {t('common.becomeAHost')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
