'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

export default function ContactPreviewPage() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  const contactCards = [
    {
      label: t('contactPage.cards.reservations.label'),
      value: t('contactPage.cards.reservations.value'),
      action: { href: '/rent', label: t('contactPage.cards.reservations.action') }
    },
    {
      label: t('contactPage.cards.carSharing.label'),
      value: t('contactPage.cards.carSharing.value'),
      action: { href: '/car-sharing', label: t('contactPage.cards.carSharing.action') }
    },
    {
      label: t('contactPage.cards.hosts.label'),
      value: t('contactPage.cards.hosts.value'),
      action: { href: '/become-a-host', label: t('contactPage.cards.hosts.action') }
    }
  ];

  const supportMoments = [
    t('contactPage.supportMoments.choosingHelp'),
    t('contactPage.supportMoments.airportQuestions'),
    t('contactPage.supportMoments.paymentSteps')
  ];

  const supportChannels = [
    {
      title: t('contactPage.channels.beforeBooking.title'),
      body: t('contactPage.channels.beforeBooking.body')
    },
    {
      title: t('contactPage.channels.afterBooking.title'),
      body: t('contactPage.channels.afterBooking.body')
    },
    {
      title: t('contactPage.channels.hostsPartnerships.title'),
      body: t('contactPage.channels.hostsPartnerships.body')
    }
  ];

  const serviceDetails = [
    {
      label: t('contactPage.serviceDetails.airportPickup.label'),
      value: t('contactPage.serviceDetails.airportPickup.value')
    },
    {
      label: t('contactPage.serviceDetails.payments.label'),
      value: t('contactPage.serviceDetails.payments.value')
    },
    {
      label: t('contactPage.serviceDetails.tripHelp.label'),
      value: t('contactPage.serviceDetails.tripHelp.value')
    }
  ];

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
        <span className="eyebrow">{t('contactPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8 }}>{t('contactPage.heading')}</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          {t('contactPage.intro')}
        </p>
        <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/faq')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            {t('contactPage.readGuestFaq')}
          </Link>
          <Link href={withSiteBase(basePath, '/become-a-host')} className="button-subtle" style={{ textDecoration: 'none' }}>
            {t('common.becomeAHost')}
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 18 }}>
        <div className="glass card" style={{ padding: 24 }}>
          <div className="label">{t('contactPage.supportCategories')}</div>
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
          <div className="label">{t('contactPage.whenGuestsReachOut')}</div>
          <h2 style={{ margin: '8px 0 10px' }}>{t('contactPage.guideNotCollect')}</h2>
          <p className="ui-muted">
            {t('contactPage.guideNotCollectDesc')}
          </p>
          <div className="stack" style={{ gap: 10 }}>
            {supportMoments.map((moment) => (
              <div key={moment} className="surface-note">{moment}</div>
            ))}
          </div>
          <div className="inline-actions" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            <Link href={withSiteBase(basePath, '/checkout')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
              {t('contactPage.openCheckout')}
            </Link>
            <Link href={withSiteBase(basePath, '/faq')} className="button-subtle" style={{ textDecoration: 'none' }}>
              {t('contactPage.readFaq')}
            </Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {supportChannels.map((channel) => (
          <article key={channel.title} className="glass card" style={{ padding: 22 }}>
            <div className="label">{t('contactPage.supportFlow')}</div>
            <h3 style={{ margin: '8px 0 10px' }}>{channel.title}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{channel.body}</p>
          </article>
        ))}
      </section>

      <section className="glass card-lg" style={{ padding: 28 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <span className="eyebrow">{t('contactPage.selfService')}</span>
            <h2 style={{ margin: 0 }}>{t('contactPage.selfServiceHeading')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('contactPage.selfServiceDesc')}
            </p>
          </div>
          <Link href={withSiteBase(basePath, '/checkout')} className="button-subtle" style={{ textDecoration: 'none' }}>
            {t('contactPage.openCheckoutHandoff')}
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
