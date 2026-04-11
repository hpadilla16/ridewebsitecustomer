'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/client';
import Link from 'next/link';
import { addDays, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fmtMoney, listingVehicleLabel, normalizePublicLocationSelectionId, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from './sitePreviewShared';
import styles from './sitePreviewPremium.module.css';
import { absoluteSiteUrl, siteConfig } from './siteConfig';
import { saveSearch, getSavedSearches, clearSavedSearches } from '../lib/savedSearches';

export default function SitePreviewHomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [bootstrap, setBootstrap] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [rentalSearch, setRentalSearch] = useState({
    pickupLocationId: '',
    returnLocationId: '',
    pickupAt: toLocalInputValue(addDays(new Date(), 1)),
    returnAt: toLocalInputValue(addDays(new Date(), 4))
  });
  const [carSharingSearch, setCarSharingSearch] = useState({
    locationId: '',
    pickupAt: toLocalInputValue(addDays(new Date(), 1)),
    returnAt: toLocalInputValue(addDays(new Date(), 2))
  });

  const heroStats = [
    { value: t('homePage.heroStats.0.value'), label: t('homePage.heroStats.0.label') },
    { value: t('homePage.heroStats.1.value'), label: t('homePage.heroStats.1.label') },
    { value: t('homePage.heroStats.2.value'), label: t('homePage.heroStats.2.label') }
  ];

  const heroFeatureCards = [
    {
      label: t('homePage.heroFeatureCards.0.label'),
      title: t('homePage.heroFeatureCards.0.title'),
      body: t('homePage.heroFeatureCards.0.body')
    },
    {
      label: t('homePage.heroFeatureCards.1.label'),
      title: t('homePage.heroFeatureCards.1.title'),
      body: t('homePage.heroFeatureCards.1.body')
    }
  ];

  const marketingMoments = [
    { title: t('homePage.marketingMoments.0.title'), body: t('homePage.marketingMoments.0.body') },
    { title: t('homePage.marketingMoments.1.title'), body: t('homePage.marketingMoments.1.body') },
    { title: t('homePage.marketingMoments.2.title'), body: t('homePage.marketingMoments.2.body') }
  ];

  const destinationStory = t('homePage.destinationStory', { returnObjects: true });

  const marketingPillars = [
    t('homePage.marketingPillars.0'),
    t('homePage.marketingPillars.1'),
    t('homePage.marketingPillars.2')
  ];

  const trustSignals = [
    { title: t('homePage.trustSignals.0.title'), body: t('homePage.trustSignals.0.body') },
    { title: t('homePage.trustSignals.1.title'), body: t('homePage.trustSignals.1.body') },
    { title: t('homePage.trustSignals.2.title'), body: t('homePage.trustSignals.2.body') }
  ];

  const guestJourneySignals = [
    t('homePage.guestJourneySignals.0'),
    t('homePage.guestJourneySignals.1'),
    t('homePage.guestJourneySignals.2'),
    t('homePage.guestJourneySignals.3')
  ];

  const premiumMoments = [
    { title: t('homePage.premiumMoments.0.title'), body: t('homePage.premiumMoments.0.body') },
    { title: t('homePage.premiumMoments.1.title'), body: t('homePage.premiumMoments.1.body') },
    { title: t('homePage.premiumMoments.2.title'), body: t('homePage.premiumMoments.2.body') }
  ];

  const reviewMoments = [
    { quote: t('homePage.reviewMoments.0.quote'), author: t('homePage.reviewMoments.0.author'), score: t('homePage.reviewMoments.0.score') },
    { quote: t('homePage.reviewMoments.1.quote'), author: t('homePage.reviewMoments.1.author'), score: t('homePage.reviewMoments.1.score') },
    { quote: t('homePage.reviewMoments.2.quote'), author: t('homePage.reviewMoments.2.author'), score: t('homePage.reviewMoments.2.score') }
  ];

  const airportJourney = [
    { title: t('homePage.airportJourney.0.title'), body: t('homePage.airportJourney.0.body') },
    { title: t('homePage.airportJourney.1.title'), body: t('homePage.airportJourney.1.body') },
    { title: t('homePage.airportJourney.2.title'), body: t('homePage.airportJourney.2.body') }
  ];

  const launchSignals = [
    t('homePage.launchSignals.0'),
    t('homePage.launchSignals.1'),
    t('homePage.launchSignals.2'),
    t('homePage.launchSignals.3')
  ];

  const prestigeSignals = [
    { title: t('homePage.prestigeSignals.0.title'), body: t('homePage.prestigeSignals.0.body') },
    { title: t('homePage.prestigeSignals.1.title'), body: t('homePage.prestigeSignals.1.body') },
    { title: t('homePage.prestigeSignals.2.title'), body: t('homePage.prestigeSignals.2.body') }
  ];

  const destinationPanels = [
    { city: t('homePage.destinationPanels.0.city'), note: t('homePage.destinationPanels.0.note') },
    { city: t('homePage.destinationPanels.1.city'), note: t('homePage.destinationPanels.1.note') },
    { city: t('homePage.destinationPanels.2.city'), note: t('homePage.destinationPanels.2.note') },
    { city: t('homePage.destinationPanels.3.city'), note: t('homePage.destinationPanels.3.note') }
  ];

  const signatureMoments = [
    { label: t('homePage.signatureMoments.0.label'), title: t('homePage.signatureMoments.0.title'), body: t('homePage.signatureMoments.0.body') },
    { label: t('homePage.signatureMoments.1.label'), title: t('homePage.signatureMoments.1.title'), body: t('homePage.signatureMoments.1.body') },
    { label: t('homePage.signatureMoments.2.label'), title: t('homePage.signatureMoments.2.title'), body: t('homePage.signatureMoments.2.body') }
  ];

  const testimonialRibbon = [
    { quote: t('homePage.testimonialRibbon.0.quote'), author: t('homePage.testimonialRibbon.0.author') },
    { quote: t('homePage.testimonialRibbon.1.quote'), author: t('homePage.testimonialRibbon.1.author') },
    { quote: t('homePage.testimonialRibbon.2.quote'), author: t('homePage.testimonialRibbon.2.author') }
  ];

  const prestigeTicker = [
    t('homePage.prestigeTicker.0'),
    t('homePage.prestigeTicker.1'),
    t('homePage.prestigeTicker.2'),
    t('homePage.prestigeTicker.3'),
    t('homePage.prestigeTicker.4'),
    t('homePage.prestigeTicker.5')
  ];

  const conciergeMoments = [
    { label: t('homePage.conciergeMoments.0.label'), title: t('homePage.conciergeMoments.0.title'), body: t('homePage.conciergeMoments.0.body') },
    { label: t('homePage.conciergeMoments.1.label'), title: t('homePage.conciergeMoments.1.title'), body: t('homePage.conciergeMoments.1.body') }
  ];

  const prestigeEditorialMoments = [
    { label: t('homePage.prestigeEditorialMoments.0.label'), title: t('homePage.prestigeEditorialMoments.0.title'), body: t('homePage.prestigeEditorialMoments.0.body') },
    { label: t('homePage.prestigeEditorialMoments.1.label'), title: t('homePage.prestigeEditorialMoments.1.title'), body: t('homePage.prestigeEditorialMoments.1.body') }
  ];

  const curatedPerks = [
    t('homePage.curatedPerks.0'),
    t('homePage.curatedPerks.1'),
    t('homePage.curatedPerks.2'),
    t('homePage.curatedPerks.3')
  ];

  const unifiedCheckoutSignals = [
    t('homePage.unifiedCheckoutSignals.0'),
    t('homePage.unifiedCheckoutSignals.1'),
    t('homePage.unifiedCheckoutSignals.2')
  ];

  useEffect(() => {
    setRecentSearches(getSavedSearches());
    (async () => {
      try {
        const payload = await api('/api/public/booking/bootstrap');
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || t('homePage.errorBootstrapFallback')));
      }
    })();
  }, []);

  useEffect(() => {
    const publicLocationOptions = buildPublicLocationOptions(bootstrap?.locations || []);
    const firstLocationId = publicLocationOptions[0]?.id || '';
    if (!firstLocationId) return;
    setRentalSearch((current) => ({
      ...current,
      pickupLocationId: normalizePublicLocationSelectionId(publicLocationOptions, current.pickupLocationId) || firstLocationId,
      returnLocationId: normalizePublicLocationSelectionId(publicLocationOptions, current.returnLocationId) || firstLocationId
    }));
    setCarSharingSearch((current) => ({
      ...current,
      locationId: normalizePublicLocationSelectionId(publicLocationOptions, current.locationId) || firstLocationId
    }));
  }, [bootstrap]);

  const locations = Array.isArray(bootstrap?.locations) ? bootstrap.locations : [];
  const publicLocationOptions = useMemo(() => buildPublicLocationOptions(locations), [locations]);
  const vehicleTypes = Array.isArray(bootstrap?.vehicleTypes) ? bootstrap.vehicleTypes : [];
  const featuredListings = Array.isArray(bootstrap?.featuredCarSharingListings) ? bootstrap.featuredCarSharingListings : [];
  const highlightedLocations = locations.slice(0, 3);
  const highlightedVehicleTypes = vehicleTypes.slice(0, 4);
  const highlightedListings = featuredListings.slice(0, 3);
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: absoluteSiteUrl('/brand/ride-logo-white-horizontal.png'),
      image: absoluteSiteUrl('/brand/ride-banner-facebook-cover.jpg'),
      description: siteConfig.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'AutoRental',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      logo: absoluteSiteUrl('/brand/ride-logo-white-horizontal.png'),
      image: absoluteSiteUrl('/brand/ride-banner-facebook-cover.jpg'),
      priceRange: '$$',
      areaServed: [
        { '@type': 'City', name: 'San Juan' },
        { '@type': 'City', name: 'Miami' },
        { '@type': 'City', name: 'Orlando' },
        { '@type': 'City', name: 'Fort Lauderdale' },
        { '@type': 'City', name: 'Los Angeles' }
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Rental Vehicles & Car Sharing',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Daily Car Rental' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Car Sharing' } }
        ]
      }
    }
  ];

  const openRental = () => {
    if (!rentalSearch.pickupLocationId || !rentalSearch.returnLocationId) {
      return setError(t('homePage.errorChooseLocationsRental'));
    }
    setBusy('rental');
    setError('');
    const pickupOption = locationOptions.find((o) => o.id === rentalSearch.pickupLocationId);
    setRecentSearches(saveSearch({ mode: 'RENTAL', locationId: rentalSearch.pickupLocationId, locationLabel: pickupOption?.label || '', pickupAt: rentalSearch.pickupAt, returnAt: rentalSearch.returnAt }));
    router.push(`${withSiteBase(basePath, '/rent')}?${searchParamsToString(rentalSearch)}`);
  };

  const openCarSharing = () => {
    if (!carSharingSearch.locationId) {
      return setError(t('homePage.errorChooseLocationCarSharing'));
    }
    setBusy('carsharing');
    setError('');
    const locOption = locationOptions.find((o) => o.id === carSharingSearch.locationId);
    setRecentSearches(saveSearch({ mode: 'CAR_SHARING', locationId: carSharingSearch.locationId, locationLabel: locOption?.label || '', pickupAt: carSharingSearch.pickupAt, returnAt: carSharingSearch.returnAt }));
    router.push(`${withSiteBase(basePath, '/car-sharing')}?${searchParamsToString(carSharingSearch)}`);
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {structuredData.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className={styles.heroShell} aria-labelledby="home-hero-title">
        <div className={styles.heroGrid}>
          <div className="stack" style={{ gap: 18 }}>
            <div className={styles.heroLogoLockup}>
              <Image
                src="/brand/ride-logo-white-horizontal.png"
                alt="Ride Car Sharing"
                width={230}
                height={75}
                className={styles.heroLogo}
                priority
              />
            </div>
            <span className="eyebrow">{t('homePage.heroEyebrow')}</span>
            <h1 id="home-hero-title" className={styles.heroTitle}>
              {t('homePage.heroTitle')}
            </h1>
            <p className={styles.heroLead}>
              {t('homePage.heroLead')}
            </p>
            <div className={styles.heroPills}>
              {marketingPillars.map((pill) => (
                <span key={pill} className={styles.heroPill}>{pill}</span>
              ))}
            </div>
            <div className={styles.heroNarrativeCard}>
              <span className={styles.heroNarrativeLabel}>{t('homePage.heroNarrativeLabel')}</span>
              <p className={styles.heroNarrativeBody}>
                {t('homePage.heroNarrativeBody')}
              </p>
            </div>
            <div className={styles.heroStatRow}>
              {heroStats.map((stat) => (
                <div key={stat.label} className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{stat.value}</div>
                  <div className={styles.heroStatLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
            {error ? <div className="label" style={{ color: '#b91c1c' }}>{error}</div> : null}
            <div className={styles.heroActionRow}>
              <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
                {t('homePage.exploreRentals')}
              </Link>
              <Link href={withSiteBase(basePath, '/car-sharing')} className={styles.heroSecondaryAction} style={{ textDecoration: 'none' }}>
                {t('homePage.browseCarSharing')}
              </Link>
            </div>
            <div className={styles.heroDestinations}>
              <span className={styles.heroDestinationsLabel}>{t('homePage.nowServing')}</span>
              <div className={styles.heroDestinationList}>{destinationStory.join(' | ')}</div>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroShowcase}>
              <div className={styles.heroShowcaseTopline}>{t('homePage.signatureLaunchDirection')}</div>
              <h3 className={styles.heroShowcaseTitle}>{t('homePage.heroShowcaseTitle')}</h3>
              <div className={styles.heroBannerFrame}>
                <Image
                  src="/brand/ride-banner-facebook-cover.jpg"
                  alt={t('homePage.fastLaneBoldRide')}
                  width={960}
                  height={540}
                  className={styles.heroBannerImage}
                />
                <div className={styles.heroBannerOverlay}>
                  <span className={styles.heroBannerEyebrow}>{t('homePage.fastLaneBoldRide')}</span>
                  <strong>{t('homePage.heroBannerOverlay')}</strong>
                </div>
              </div>
              <div className={styles.heroFeatureGrid}>
                {heroFeatureCards.map((item) => (
                  <article key={item.title} className={styles.heroFeatureCard}>
                    <span className={styles.heroFeatureLabel}>{item.label}</span>
                    <h4 className={styles.heroFeatureTitle}>{item.title}</h4>
                    <p className={styles.heroFeatureBody}>{item.body}</p>
                  </article>
                ))}
              </div>
              <div className={styles.signalStack}>
                {launchSignals.map((signal) => (
                  <div key={signal} className={styles.signalItem}>{signal}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.motionRibbon} aria-label={t('homePage.brandTrustSignals')}>
        <div className={styles.motionTrack}>
          {[...prestigeTicker, ...prestigeTicker].map((item, index) => (
            <div key={`${item}-${index}`} className={styles.motionPill}>
              <span className={styles.motionDot} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.editorialSplit} aria-labelledby="prestige-positioning-title">
        <article className={`glass card-lg ${styles.editorialFeatureCard}`}>
          <div className={styles.editorialFeatureGlow} />
          <div className={styles.editorialFeatureCopy}>
            <span className="eyebrow">{t('homePage.prestigePositioning')}</span>
            <h2 id="prestige-positioning-title" style={{ margin: 0 }}>{t('homePage.prestigePositioningTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.prestigePositioningLead')}
            </p>
            <div className={styles.editorialMomentGrid}>
              {prestigeEditorialMoments.map((item) => (
                <div key={item.title} className={styles.editorialMoment}>
                  <span className={styles.signatureLabel}>{item.label}</span>
                  <h3 style={{ margin: '10px 0 8px' }}>{item.title}</h3>
                  <p className="ui-muted" style={{ margin: 0 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.editorialFeatureShowcase}>
            <div className={styles.editorialShowTopline}>{t('homePage.curatedGuestCues')}</div>
            <div className={styles.editorialPerkGrid}>
              {curatedPerks.map((perk) => (
                <div key={perk} className={styles.editorialPerkCard}>
                  <span className={styles.motionDot} />
                  <strong>{perk}</strong>
                </div>
              ))}
            </div>
            <div className={styles.editorialShowFooter}>
              <span className="label">{t('homePage.websiteDirection')}</span>
              <strong>{t('homePage.websiteDirectionBody')}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.trustBand} aria-labelledby="trust-layer-title">
        <div className={`glass card-lg ${styles.trustPanel}`}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">{t('homePage.trustLayer')}</span>
            <h2 id="trust-layer-title" style={{ margin: 0 }}>{t('homePage.trustLayerTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.trustLayerLead')}
            </p>
          </div>
          <div className={styles.trustGrid}>
            {trustSignals.map((item) => (
              <div key={item.title} className={styles.trustCard}>
                <div className="label">{item.title}</div>
                <p className="ui-muted" style={{ margin: '10px 0 0' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`glass card ${styles.showcasePanel}`}>
          <div className={styles.showcaseStack}>
            <div className={styles.showcaseCardPrimary}>
              <div className="label" style={{ color: 'rgba(246,248,255,0.76)' }}>{t('homePage.guestJourney')}</div>
              <h3 style={{ margin: '8px 0 10px', fontSize: '1.55rem' }}>{t('homePage.modernBookingFlow')}</h3>
              <div className={styles.showcaseRow}>
                {guestJourneySignals.map((item) => (
                  <span key={item} className={styles.showcaseChip}>{item}</span>
                ))}
              </div>
            </div>
            <div className={styles.showcaseCardSecondary}>
              <div className="label">{t('homePage.guestPromise')}</div>
              <h3 style={{ margin: '8px 0 10px' }}>{t('homePage.guestPromiseTitle')}</h3>
              <p className="ui-muted" style={{ margin: 0 }}>
                {t('homePage.guestPromiseBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.socialProofGrid}>
        {reviewMoments.map((review) => (
          <article key={review.quote} className={`glass card ${styles.reviewCard}`}>
            <div className={styles.reviewScore}>{review.score}</div>
            <p className={styles.reviewQuote}>"{review.quote}"</p>
            <div className="label">{review.author}</div>
          </article>
        ))}
      </section>

      <section className={`glass card-lg ${styles.prestigeBand}`}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">{t('homePage.prestigeLayer')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.prestigeLayerTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.prestigeLayerLead')}
          </p>
        </div>
        <div className={styles.prestigeGrid}>
          {prestigeSignals.map((signal) => (
            <article key={signal.title} className={styles.prestigeCard}>
              <div className={styles.prestigeIcon} />
              <div className="label">{signal.title}</div>
              <p className="ui-muted" style={{ margin: '10px 0 0' }}>{signal.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.laneGrid}>
        <div className={`glass card ${styles.laneCard}`}>
          <div className={styles.laneHeader}>
            <span className={styles.laneBadge}>{t('homePage.guestLane')}</span>
            <h2 className={styles.laneTitle}>{t('homePage.traditionalRentals')}</h2>
            <p className={styles.laneLead}>
              {t('homePage.traditionalRentalsLead')}
            </p>
          </div>
          <label className="label">{t('homePage.pickupLocation')}</label>
          <select value={rentalSearch.pickupLocationId} onChange={(e) => setRentalSearch((current) => ({ ...current, pickupLocationId: e.target.value }))}>
            <option value="">{t('homePage.selectLocation')}</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <label className="label">{t('homePage.returnLocation')}</label>
          <select value={rentalSearch.returnLocationId} onChange={(e) => setRentalSearch((current) => ({ ...current, returnLocationId: e.target.value }))}>
            <option value="">{t('homePage.selectLocation')}</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <div className="grid2">
            <div className="stack">
              <label className="label">{t('homePage.pickup')}</label>
              <input type="datetime-local" value={rentalSearch.pickupAt} onChange={(e) => setRentalSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
            </div>
            <div className="stack">
              <label className="label">{t('homePage.return')}</label>
              <input type="datetime-local" value={rentalSearch.returnAt} onChange={(e) => setRentalSearch((current) => ({ ...current, returnAt: e.target.value }))} />
            </div>
          </div>
          <button type="button" className="ios-action-btn" onClick={openRental} disabled={busy === 'rental'}>
            {busy === 'rental' ? t('homePage.opening') : t('homePage.searchRentals')}
          </button>
        </div>

        <div className={`glass card ${styles.laneCard}`}>
          <div className={styles.laneHeader}>
            <span className={styles.laneBadge}>{t('homePage.guestLane')}</span>
            <h2 className={styles.laneTitle}>{t('homePage.carSharing')}</h2>
            <p className={styles.laneLead}>
              {t('homePage.carSharingLead')}
            </p>
          </div>
          <label className="label">{t('homePage.location')}</label>
          <select value={carSharingSearch.locationId} onChange={(e) => setCarSharingSearch((current) => ({ ...current, locationId: e.target.value }))}>
            <option value="">{t('homePage.selectLocation')}</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <div className="grid2">
            <div className="stack">
              <label className="label">{t('homePage.pickup')}</label>
              <input type="datetime-local" value={carSharingSearch.pickupAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
            </div>
            <div className="stack">
              <label className="label">{t('homePage.return')}</label>
              <input type="datetime-local" value={carSharingSearch.returnAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, returnAt: e.target.value }))} />
            </div>
          </div>
          <button type="button" className="ios-action-btn" onClick={openCarSharing} disabled={busy === 'carsharing'}>
            {busy === 'carsharing' ? t('homePage.opening') : t('homePage.searchCarSharing')}
          </button>
        </div>
      </section>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <section className="glass card-lg" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('homePage.recentSearches')}</h2>
            <button onClick={() => { clearSavedSearches(); setRecentSearches([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontSize: '0.78rem', fontWeight: 600 }}>{t('homePage.clearAll')}</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recentSearches.map((s) => (
              <Link
                key={s.id}
                href={withSiteBase(basePath, s.mode === 'CAR_SHARING' ? `/car-sharing?locationId=${encodeURIComponent(s.locationId)}&pickupAt=${encodeURIComponent(s.pickupAt)}&returnAt=${encodeURIComponent(s.returnAt)}` : `/rent?pickupLocationId=${encodeURIComponent(s.locationId)}&returnLocationId=${encodeURIComponent(s.locationId)}&pickupAt=${encodeURIComponent(s.pickupAt)}&returnAt=${encodeURIComponent(s.returnAt)}`)}
                style={{ flex: '0 0 auto', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(135,82,254,.1)', background: 'rgba(135,82,254,.03)', textDecoration: 'none', display: 'grid', gap: 2, minWidth: 180 }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6e49ff', textTransform: 'uppercase' }}>{s.mode === 'CAR_SHARING' ? t('homePage.carSharing') : t('homePage.rental')}</span>
                <span style={{ fontWeight: 600, color: '#1e2847', fontSize: '0.88rem' }}>{s.locationLabel || t('homePage.search')}</span>
                {s.pickupAt && <span style={{ fontSize: '0.76rem', color: '#6b7a9a' }}>{new Date(s.pickupAt).toLocaleDateString()}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.destinationRail}>
        {destinationPanels.map((panel, index) => (
          <article key={panel.city} className={`glass card ${styles.destinationCard}`} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="label">{t('homePage.destination')}</div>
            <h3 style={{ margin: '8px 0 8px' }}>{panel.city}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{panel.note}</p>
          </article>
        ))}
      </section>

      <section className={styles.conciergeSplit}>
        <div className={`glass card-lg ${styles.conciergeStage}`}>
          <div className={styles.conciergeVisualGlow} />
          <div className={styles.conciergeCopy}>
            <span className="eyebrow">{t('homePage.conciergePositioning')}</span>
            <h2 style={{ margin: 0 }}>{t('homePage.conciergeTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.conciergeLead')}
            </p>
            <div className={styles.conciergeMomentGrid}>
              {conciergeMoments.map((item) => (
                <article key={item.title} className={styles.conciergeMoment}>
                  <span className={styles.signatureLabel}>{item.label}</span>
                  <h3 style={{ margin: '10px 0 8px' }}>{item.title}</h3>
                  <p className="ui-muted" style={{ margin: 0 }}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.conciergeShowcard}>
            <div className={styles.conciergeShowTopline}>{t('homePage.signatureStorefrontDirection')}</div>
            <div className={styles.conciergeShowStats}>
              <div className={styles.conciergeStatCard}>
                <span className="label">{t('homePage.guestFeel')}</span>
                <strong>{t('homePage.guestFeelValue')}</strong>
              </div>
              <div className={styles.conciergeStatCard}>
                <span className="label">{t('homePage.operationalTruth')}</span>
                <strong>{t('homePage.operationalTruthValue')}</strong>
              </div>
            </div>
            <div className={styles.conciergeBannerWrap}>
              <Image
                src="/brand/ride-banner-facebook-cover.jpg"
                alt="Ride Car Sharing premium banner"
                width={960}
                height={540}
                className={styles.conciergeBanner}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`glass card-lg ${styles.signatureSection}`}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">{t('homePage.signatureExperience')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.signatureExperienceTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.signatureExperienceLead')}
          </p>
        </div>
        <div className={styles.signatureGrid}>
          {signatureMoments.map((item) => (
            <article key={item.title} className={styles.signatureCard}>
              <span className={styles.signatureLabel}>{item.label}</span>
              <h3 style={{ margin: '8px 0 10px' }}>{item.title}</h3>
              <p className="ui-muted" style={{ margin: 0 }}>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`glass card-lg ${styles.testimonialSection}`}>
        <div className={styles.testimonialHeader}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">{t('homePage.socialProofDirection')}</span>
            <h2 style={{ margin: 0 }}>{t('homePage.socialProofTitle')}</h2>
          </div>
          <div className={styles.testimonialBadge}>{t('homePage.socialProofBadge')}</div>
        </div>
        <div className={styles.testimonialGrid}>
          {testimonialRibbon.map((item) => (
            <div key={item.quote} className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>{item.quote}</p>
              <span className={styles.testimonialAuthor}>{item.author}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`glass card-lg ${styles.journeyPanel}`}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">{t('homePage.airportPickupStory')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.airportPickupStoryTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.airportPickupStoryLead')}
          </p>
        </div>
        <div className={styles.journeyGrid}>
          <div className={styles.timelineRail}>
            {airportJourney.map((step, index) => (
              <div key={step.title} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>{index + 1}</div>
                <div className={styles.timelineContent}>
                  <div className="label">{t('homePage.step', { number: index + 1 })}</div>
                  <h3 style={{ margin: '6px 0 8px' }}>{step.title}</h3>
                  <p className="ui-muted" style={{ margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.airportCanvas}>
            <div className={styles.airportGlow} />
            <div className={styles.airportBoard}>
              <div className={styles.boardTopline}>{t('homePage.arrivalFlow')}</div>
              <div className={styles.boardStage}>
                <span className={styles.boardLabel}>{t('homePage.pickupMode')}</span>
                <strong>{t('homePage.pickupModeValue')}</strong>
              </div>
              <div className={styles.boardRow}>
                <div className={styles.boardCard}>
                  <span className="label">{t('homePage.dueNow')}</span>
                  <strong>{fmtMoney(bootstrap?.featuredCarSharingListings?.[0]?.baseDailyRate || 49)}</strong>
                  <p className="ui-muted" style={{ margin: '8px 0 0' }}>{t('homePage.dueNowBody')}</p>
                </div>
                <div className={styles.boardCard}>
                  <span className="label">{t('homePage.pickupPromise')}</span>
                  <strong>{t('homePage.pickupPromiseValue')}</strong>
                  <p className="ui-muted" style={{ margin: '8px 0 0' }}>{t('homePage.pickupPromiseBody')}</p>
                </div>
              </div>
              <div className={styles.boardRoute}>
                {guestJourneySignals.map((item) => (
                  <span key={item} className={styles.boardChip}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`glass card-lg ${styles.editorialPanel}`}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">{t('homePage.premiumMomentsEyebrow')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.premiumMomentsTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.premiumMomentsLead')}
          </p>
        </div>
        <div className="metric-grid">
          {premiumMoments.map((item) => (
            <div key={item.title} className={styles.storyCard}>
              <div className="label">{item.title}</div>
              <p className="ui-muted" style={{ margin: '10px 0 0' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`glass card-lg ${styles.editorialPanel}`}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">{t('homePage.howItWorks')}</span>
            <h2 style={{ margin: 0 }}>{t('homePage.howItWorksTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.howItWorksLead')}
            </p>
          </div>
            <Link href={withSiteBase(basePath, '/checkout')} className="button-subtle" style={{ textDecoration: 'none' }}>
              {t('homePage.seeCheckoutFlow')}
            </Link>
        </div>
        <div className="metric-grid">
          {marketingMoments.map((item, index) => (
            <div key={item.title} className={styles.processCard}>
              <div className="label">{t('homePage.step', { number: index + 1 })}</div>
              <h3 style={{ margin: '8px 0 6px' }}>{item.title}</h3>
              <p className="ui-muted" style={{ margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`glass card-lg ${styles.checkoutSection}`}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div className="stack" style={{ gap: 8, maxWidth: 780 }}>
            <span className="eyebrow">{t('homePage.guidedReservationFlow')}</span>
            <h2 style={{ margin: 0 }}>{t('homePage.guidedReservationFlowTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.guidedReservationFlowLead')}
            </p>
          </div>
          <Link
            href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
              pickupLocationId: rentalSearch.pickupLocationId,
              returnLocationId: rentalSearch.returnLocationId,
              pickupAt: rentalSearch.pickupAt,
              returnAt: rentalSearch.returnAt
            })}`}
            className={`ios-action-btn ${styles.glowButton}`}
            style={{ textDecoration: 'none' }}
            >
              {t('homePage.previewReservationFlow')}
            </Link>
        </div>
        <div className={styles.checkoutGrid}>
          <div className={styles.checkoutCard}>
            <span className="label">{t('homePage.rentalLane')}</span>
            <strong>{t('homePage.rentalLaneValue')}</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">{t('homePage.carSharingLane')}</span>
            <strong>{t('homePage.carSharingLaneValue')}</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">{t('homePage.trustedSystem')}</span>
            <strong>{t('homePage.trustedSystemValue')}</strong>
          </div>
        </div>
        <div className={styles.checkoutSignalRow}>
          {unifiedCheckoutSignals.map((signal) => (
            <span key={signal} className={styles.checkoutSignal}>{signal}</span>
          ))}
        </div>
      </section>

      <section className={styles.launchFinale}>
        <div className={styles.launchFinaleCopy}>
          <span className="eyebrow">{t('homePage.launchReadyDirection')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.launchReadyTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.launchReadyLead')}
          </p>
        </div>
        <div className={styles.launchFinaleActions}>
          <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            {t('homePage.exploreRentalJourney')}
          </Link>
          <Link href={withSiteBase(basePath, '/car-sharing')} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
            {t('homePage.exploreCarSharingJourney')}
          </Link>
        </div>
      </section>

      <section className={styles.splitFeature}>
        <div className={`glass card ${styles.editorialPanel}`}>
          <span className="eyebrow">{t('homePage.learnMoreAboutUs')}</span>
          <h2 style={{ margin: '8px 0 10px' }}>{t('homePage.learnMoreTitle')}</h2>
          <p className="ui-muted">
            {t('homePage.learnMoreLead')}
          </p>
          <div className="stack" style={{ gap: 12 }}>
            <div className="surface-note">
              <strong>{t('homePage.browseAndBook')}</strong>
              <div className="ui-muted">{t('homePage.browseAndBookBody')}</div>
            </div>
            <div className="surface-note">
              <strong>{t('homePage.pickupAndGo')}</strong>
              <div className="ui-muted">{t('homePage.pickupAndGoBody')}</div>
            </div>
            <div className="surface-note">
              <strong>{t('homePage.exploreAndReturn')}</strong>
              <div className="ui-muted">{t('homePage.exploreAndReturnBody')}</div>
            </div>
          </div>
        </div>

      </section>

      <section className={styles.spotlightGrid}>
        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">{t('homePage.liveLocations')}</span>
              <h3 style={{ margin: '6px 0 0' }}>{t('homePage.airportAndCityHubs')}</h3>
            </div>
            <Link href={withSiteBase(basePath, '/fleet')} className="button-subtle" style={{ textDecoration: 'none' }}>{t('homePage.viewFleet')}</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedLocations.length ? highlightedLocations.map((location) => (
              <div key={location.id} className="surface-note">
                <strong>{location.name}</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
            )) : <div className="ui-muted">{t('homePage.noPickupLocations')}</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">{t('homePage.rentalClasses')}</span>
              <h3 style={{ margin: '6px 0 0' }}>{t('homePage.availableVehicleClasses')}</h3>
            </div>
            <Link href={withSiteBase(basePath, '/rent')} className="button-subtle" style={{ textDecoration: 'none' }}>{t('homePage.searchRentals')}</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedVehicleTypes.length ? highlightedVehicleTypes.map((vehicleType) => (
              <div key={vehicleType.id} className="surface-note">
                <strong>{vehicleTypeLabel(vehicleType)}</strong>
                <div className="ui-muted">{vehicleType.code || t('homePage.rentalClass')}</div>
              </div>
            )) : <div className="ui-muted">{t('homePage.noVehicleClasses')}</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">{t('homePage.carSharingCatalog')}</span>
              <h3 style={{ margin: '6px 0 0' }}>{t('homePage.featuredCarSharingVehicles')}</h3>
            </div>
            <Link href={withSiteBase(basePath, '/car-sharing')} className="button-subtle" style={{ textDecoration: 'none' }}>{t('homePage.openCatalog')}</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedListings.length ? highlightedListings.map((listing) => (
              <div key={listing.id} className="surface-note">
                <strong>{listing.title || listingVehicleLabel(listing)}</strong>
                <div className="ui-muted">
                  {publicLocationLabel(listing.location)}{Number(listing.baseDailyRate || 0) ? ` | ${t('homePage.fromPerDay', { price: fmtMoney(listing.baseDailyRate) })}` : ''}
                </div>
              </div>
            )) : <div className="ui-muted">{t('homePage.noFeaturedListings')}</div>}
          </div>
        </div>
      </section>

    </div>
  );
}
