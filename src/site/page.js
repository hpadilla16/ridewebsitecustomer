'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/client';
import Link from 'next/link';
import { addDays, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fmtMoney, listingVehicleLabel, normalizePublicLocationSelectionId, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from './sitePreviewShared';
import styles from './sitePreviewPremium.module.css';
import { absoluteSiteUrl, siteConfig } from './siteConfig';
import { saveSearch, getSavedSearches, clearSavedSearches } from '../lib/savedSearches';

function ShowcaseGallery({ vehicleTypes, featuredListings, basePath, t }) {
  const slides = useMemo(() => {
    const items = [];
    vehicleTypes.forEach((vt) => items.push({ type: 'rental', id: vt.id, label: vehicleTypeLabel(vt), image: vt.imageUrl, href: `/rent/${vt.id}` }));
    featuredListings.forEach((l) => items.push({ type: 'carsharing', id: l.id, label: listingVehicleLabel(l), image: l.imageUrls?.[0], href: `/car-sharing/${l.id}`, host: l.hostDisplayName, rating: l.hostAvgRating, price: l.baseDailyRate }));
    return items;
  }, [vehicleTypes, featuredListings]);

  const [current, setCurrent] = useState(0);
  const count = slides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [count, next]);

  if (!count) return null;
  const slide = slides[current];

  return (
    <div className={styles.showcaseGallery}>
      <Link href={withSiteBase(basePath, slide.href)} className={styles.gallerySlide} style={{ textDecoration: 'none' }}>
        {slide.image && <img src={slide.image} alt={slide.label} className={styles.galleryImage} />}
      </Link>
      <div className={styles.galleryInfo}>
        <div className={styles.galleryInfoLeft}>
          <span className={styles.gallerySlideBadge} style={slide.type === 'carsharing' ? { background: 'rgba(15,176,216,.1)', color: '#0a7e9c' } : undefined}>
            {slide.type === 'rental' ? t('homePage.rentalClass') : 'Car Sharing'}
          </span>
          <strong className={styles.gallerySlideTitle}>{slide.label}</strong>
          {slide.host && <span className={styles.gallerySlideHost}>{slide.host}{slide.rating ? ` · ${slide.rating}★` : ''}</span>}
        </div>
        {slide.price && <span className={styles.gallerySlidePrice}>{fmtMoney(slide.price)}{t('common.perDay')}</span>}
      </div>
      {count > 1 && (
        <div className={styles.galleryControls}>
          <button onClick={(e) => { e.preventDefault(); prev(); }} className={styles.galleryArrow} aria-label="Previous">‹</button>
          <span className={styles.galleryCounter}>{current + 1} / {count}</span>
          <button onClick={(e) => { e.preventDefault(); next(); }} className={styles.galleryArrow} aria-label="Next">›</button>
        </div>
      )}
    </div>
  );
}

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

  const featureHighlights = [
    t('homePage.features.0'),
    t('homePage.features.1'),
    t('homePage.features.2'),
    t('homePage.features.3'),
    t('homePage.features.4'),
    t('homePage.features.5'),
    t('homePage.features.6'),
    t('homePage.features.7')
  ];

  const trustSignals = [
    { title: t('homePage.trustSignals.0.title'), body: t('homePage.trustSignals.0.body') },
    { title: t('homePage.trustSignals.1.title'), body: t('homePage.trustSignals.1.body') },
    { title: t('homePage.trustSignals.2.title'), body: t('homePage.trustSignals.2.body') }
  ];

  const reviewMoments = [
    { quote: t('homePage.reviewMoments.0.quote'), author: t('homePage.reviewMoments.0.author'), score: t('homePage.reviewMoments.0.score') },
    { quote: t('homePage.reviewMoments.1.quote'), author: t('homePage.reviewMoments.1.author'), score: t('homePage.reviewMoments.1.score') },
    { quote: t('homePage.reviewMoments.2.quote'), author: t('homePage.reviewMoments.2.author'), score: t('homePage.reviewMoments.2.score') }
  ];

  const destinationPanels = [
    { city: t('homePage.destinationPanels.0.city'), note: t('homePage.destinationPanels.0.note') },
    { city: t('homePage.destinationPanels.1.city'), note: t('homePage.destinationPanels.1.note') },
    { city: t('homePage.destinationPanels.2.city'), note: t('homePage.destinationPanels.2.note') },
    { city: t('homePage.destinationPanels.3.city'), note: t('homePage.destinationPanels.3.note') }
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

      {/* 1. Hero */}
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
            <div className={styles.heroStatRow}>
              {heroStats.map((stat) => (
                <div key={stat.label} className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{stat.value}</div>
                  <div className={styles.heroStatLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className={styles.heroDestinations}>
              <span className={styles.heroDestinationsLabel}>{t('homePage.nowServing')}</span>
              <div className={styles.heroDestinationList}>{destinationStory.join(' | ')}</div>
            </div>
          </div>

          <div className={styles.heroSearchPanel}>
            {error ? <div className="label" style={{ color: '#ff8a8a', marginBottom: 8 }}>{error}</div> : null}
            <div className={styles.heroSearchCard}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{t('homePage.traditionalRentals')}</h3>
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
              <div className={styles.heroDateRow}>
                <div className={styles.heroDateField}>
                  <label className="label">{t('homePage.pickup')}</label>
                  <input type="datetime-local" value={rentalSearch.pickupAt} onChange={(e) => setRentalSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
                </div>
                <div className={styles.heroDateField}>
                  <label className="label">{t('homePage.return')}</label>
                  <input type="datetime-local" value={rentalSearch.returnAt} onChange={(e) => setRentalSearch((current) => ({ ...current, returnAt: e.target.value }))} />
                </div>
              </div>
              <button type="button" className="ios-action-btn" onClick={openRental} disabled={busy === 'rental'}>
                {busy === 'rental' ? t('homePage.opening') : t('homePage.searchRentals')}
              </button>
            </div>

            <div className={styles.heroSearchCard}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{t('homePage.carSharing')}</h3>
              <label className="label">{t('homePage.location')}</label>
              <select value={carSharingSearch.locationId} onChange={(e) => setCarSharingSearch((current) => ({ ...current, locationId: e.target.value }))}>
                <option value="">{t('homePage.selectLocation')}</option>
                {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
              </select>
              <div className={styles.heroDateRow}>
                <div className={styles.heroDateField}>
                  <label className="label">{t('homePage.pickup')}</label>
                  <input type="datetime-local" value={carSharingSearch.pickupAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
                </div>
                <div className={styles.heroDateField}>
                  <label className="label">{t('homePage.return')}</label>
                  <input type="datetime-local" value={carSharingSearch.returnAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, returnAt: e.target.value }))} />
                </div>
              </div>
              <button type="button" className="ios-action-btn" onClick={openCarSharing} disabled={busy === 'carsharing'}>
                {busy === 'carsharing' ? t('homePage.opening') : t('homePage.searchCarSharing')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature carousel */}
      <section className={styles.motionRibbon} aria-label={t('homePage.brandTrustSignals')}>
        <div className={styles.motionTrack}>
          {[...featureHighlights, ...featureHighlights].map((item, index) => (
            <div key={`${item}-${index}`} className={styles.motionPill}>
              <span className={styles.motionDot} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recent searches */}
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

      {/* 4. Trust signals + showcase carousel */}
      <section className={styles.trustBand} aria-labelledby="trust-section-title">
        <div className={`glass card-lg ${styles.trustPanel}`}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">{t('homePage.whyChooseUs')}</span>
            <h2 id="trust-section-title" style={{ margin: 0 }}>{t('homePage.trustSectionTitle')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('homePage.trustSectionLead')}
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

        <ShowcaseGallery
          vehicleTypes={vehicleTypes}
          featuredListings={featuredListings}
          basePath={basePath}
          t={t}
        />
      </section>

      {/* 5. How it works */}
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

      {/* 6. Reviews */}
      <section className={`glass card-lg ${styles.editorialPanel}`}>
        <div className={styles.editorialHeader} style={{ marginBottom: 18 }}>
          <span className="eyebrow">{t('homePage.guestReviews')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.guestReviewsTitle')}</h2>
        </div>
        <div className={styles.socialProofGrid}>
          {reviewMoments.map((review) => (
            <article key={review.quote} className={`glass card ${styles.reviewCard}`}>
              <div className={styles.reviewScore}>{review.score}</div>
              <p className={styles.reviewQuote}>"{review.quote}"</p>
              <div className="label">{review.author}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Featured locations */}
      <section className={styles.destinationRail}>
        {destinationPanels.map((panel, index) => (
          <article key={panel.city} className={`glass card ${styles.destinationCard}`} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="label">{t('homePage.destination')}</div>
            <h3 style={{ margin: '8px 0 8px' }}>{panel.city}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{panel.note}</p>
          </article>
        ))}
      </section>

      {/* 8. Spotlight grid */}
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

      {/* 9. Final CTA */}
      <section className={styles.launchFinale}>
        <div className={styles.launchFinaleCopy}>
          <span className="eyebrow">{t('homePage.readyToBook')}</span>
          <h2 style={{ margin: 0 }}>{t('homePage.readyToBookTitle')}</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            {t('homePage.readyToBookLead')}
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

    </div>
  );
}
