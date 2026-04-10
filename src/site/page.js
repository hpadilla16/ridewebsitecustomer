'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../lib/client';
import Link from 'next/link';
import { addDays, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fmtMoney, listingVehicleLabel, normalizePublicLocationSelectionId, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from './sitePreviewShared';
import styles from './sitePreviewPremium.module.css';
import { absoluteSiteUrl, siteConfig } from './siteConfig';
import { saveSearch, getSavedSearches, clearSavedSearches } from '../lib/savedSearches';

const heroStats = [
  { value: '24/7', label: 'Guest-first booking access' },
  { value: '2 lanes', label: 'Rentals plus car sharing' },
  { value: '1 flow', label: 'Trusted payment and portal handoff' }
];

const heroFeatureCards = [
  {
    label: 'Airport-first arrival',
    title: 'Know exactly where to go and what to expect before you land',
    body: 'Pickup instructions, payment details, and digital readiness are all handled before your flight touches down.'
  },
  {
    label: 'Two ways to ride',
    title: 'Traditional rentals and car sharing, one seamless checkout',
    body: 'Choose a rental class or browse locally hosted vehicles — both backed by the same trusted reservation system.'
  }
];


const marketingMoments = [
  {
    title: 'Search your ride',
    body: 'Explore vehicle classes, pickup hubs, and car sharing listings with real-time pricing and availability.'
  },
  {
    title: 'Reserve with confidence',
    body: 'Clear pricing, transparent fees, and trip protection give you confidence before you commit.'
  },
  {
    title: 'Pick up and go',
    body: 'Airport staging, complimentary shuttle pickup, and digital inspections make your first moment with the car seamless.'
  }
];

const destinationStory = [
  'Puerto Rico',
  'Miami',
  'Orlando',
  'Fort Lauderdale',
  'Los Angeles',
  'Ecuador'
];

const marketingPillars = [
  'Airport-ready pickup',
  'Hosted payment trust',
  'Rentals plus car sharing in one storefront'
];

const trustSignals = [
  {
    title: 'Airport-friendly pickup',
    body: 'Pickup instructions, location details, and timing are confirmed before you arrive.'
  },
  {
    title: 'Secure payments',
    body: 'Pay securely online with saved cards, deposit holds, and transparent pricing — no surprises at pickup.'
  },
  {
    title: 'Digital readiness',
    body: 'Complete your customer info, sign your agreement, and handle inspections digitally before your trip.'
  }
];

const guestJourneySignals = [
  'Search a class or listing',
  'Review pricing and pickup',
  'Checkout in one trusted flow',
  'Finish payment and documents online'
];

const premiumMoments = [
  {
    title: 'Designed for arrival',
    body: 'Airport staging, pickup timing, and clear expectations from the moment you start searching.'
  },
  {
    title: 'Built for trust',
    body: 'Detailed vehicle pages, transparent due-now pricing, and trip protection on every booking.'
  },
  {
    title: 'Powered by operations',
    body: 'Real-time availability, professional fleet management, and a dedicated support team behind every trip.'
  }
];

const reviewMoments = [
  {
    quote: 'Booking felt like a premium travel experience. Clear pricing, easy airport pickup, everything was ready when I landed.',
    author: 'San Juan guest',
    score: '5/5'
  },
  {
    quote: 'I loved having both rental and car sharing options in one place. The checkout was fast and secure.',
    author: 'Miami traveler',
    score: '5/5'
  },
  {
    quote: 'The pickup instructions were perfect. I knew exactly where to go and what to expect. No phone calls needed.',
    author: 'Orlando visitor',
    score: '5/5'
  }
];

const airportJourney = [
  {
    title: 'Choose your trip',
    body: 'Browse rentals or car sharing, compare pricing, and pick the vehicle that fits your plans.'
  },
  {
    title: 'Confirm pickup',
    body: 'Airport staging details, shuttle info, and pickup timing are confirmed before you check out.'
  },
  {
    title: 'Start your trip',
    body: 'Pay securely, complete your agreement digitally, and pick up your car with a quick inspection.'
  }
];

const launchSignals = [
  'Airport-first Puerto Rico flow',
  'Hosted payments with transparent pricing',
  'Marketplace visuals for car sharing',
  'Verified hosts and trip protection'
];

const prestigeSignals = [
  {
    title: 'Hospitality-grade trust',
    body: 'Every detail — from pricing clarity to pickup instructions — is designed to build confidence before you book.'
  },
  {
    title: 'Curated experience',
    body: 'Every vehicle, listing, and pickup location is presented with care, not just listed.'
  },
  {
    title: 'Premium design',
    body: 'Clean layout, smooth transitions, and thoughtful details create an elevated booking experience.'
  }
];

const destinationPanels = [
  { city: 'San Juan', note: 'Airport arrivals, fast handoff, high-volume guest flow' },
  { city: 'Miami', note: 'Leisure travel and short-stay demand with premium first impression' },
  { city: 'Orlando', note: 'Family travel, clearer class comparison, smoother booking reassurance' },
  { city: 'Fort Lauderdale', note: 'Cruise and airport transitions with strong pickup storytelling' }
];

const signatureMoments = [
  {
    label: 'Curated search',
    title: 'Find the perfect vehicle for your trip',
    body: 'Browse featured listings, compare vehicle classes, and get clear pickup details so you feel confident choosing.'
  },
  {
    label: 'Arrival confidence',
    title: 'Airport-ready from the moment you book',
    body: 'Arrival instructions, pickup timing, and pricing are confirmed upfront so your airport experience is smooth.'
  },
  {
    label: 'One trusted system',
    title: 'Premium experience backed by professional operations',
    body: 'Every booking, payment, inspection, and follow-up is handled by our dedicated operations team.'
  }
];

const testimonialRibbon = [
  {
    quote: 'The airport pickup was seamless. I knew exactly where to go.',
    author: 'Recent guest'
  },
  {
    quote: 'Clear pricing, easy checkout, and the car was ready when I arrived.',
    author: 'Verified traveler'
  },
  {
    quote: 'Having rentals and car sharing in one place made planning so much easier.',
    author: 'Repeat customer'
  }
];

const prestigeTicker = [
  'Airport-first guest experience',
  'Secure hosted payments',
  'Puerto Rico to Miami coverage',
  'Marketplace-style car sharing',
  'Digital agreements and inspections',
  'Verified hosts and trip protection'
];

const conciergeMoments = [
  {
    label: 'Arrival-first design',
    title: 'Confidence before the search even starts',
    body: 'From the first screen, you see exactly where to pick up, what to pay, and how the trip works.'
  },
  {
    label: 'Concierge clarity',
    title: 'Everything you need to know, upfront',
    body: 'Pickup location, payment breakdown, and trip details are all clear before you ever need to call us.'
  }
];

const prestigeEditorialMoments = [
  {
    label: 'Signature feel',
    title: 'A calmer, richer first impression',
    body: 'Premium design and thoughtful details create an experience that feels closer to luxury travel than a typical car rental.'
  },
  {
    label: 'Operational clarity',
    title: 'Airport-ready journeys with less guesswork',
    body: 'Pickup details, payment transparency, and arrival expectations are woven into every step of your booking.'
  }
];

const curatedPerks = [
  'Guided airport arrival story',
  'Hosted payment reassurance',
  'Digital agreement and portal continuity',
  'One storefront for rentals and car sharing'
];

const unifiedCheckoutSignals = [
  'Real-time pricing and instant reservation',
  'Secure hosted payments with transparent totals',
  'Digital documents, agreements, and pickup confirmation'
];

export default function SitePreviewHomePage() {
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

  useEffect(() => {
    setRecentSearches(getSavedSearches());
    (async () => {
      try {
        const payload = await api('/api/public/booking/bootstrap');
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || 'Unable to load booking bootstrap'));
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
      return setError('Choose pickup and return locations before searching rentals.');
    }
    setBusy('rental');
    setError('');
    const pickupOption = locationOptions.find((o) => o.id === rentalSearch.pickupLocationId);
    setRecentSearches(saveSearch({ mode: 'RENTAL', locationId: rentalSearch.pickupLocationId, locationLabel: pickupOption?.label || '', pickupAt: rentalSearch.pickupAt, returnAt: rentalSearch.returnAt }));
    router.push(`${withSiteBase(basePath, '/rent')}?${searchParamsToString(rentalSearch)}`);
  };

  const openCarSharing = () => {
    if (!carSharingSearch.locationId) {
      return setError('Choose a location before searching car sharing.');
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
            <span className="eyebrow">Ride Car Sharing</span>
            <h1 id="home-hero-title" className={styles.heroTitle}>
              Affordable rentals, car sharing, and a seamless guest experience.
            </h1>
            <p className={styles.heroLead}>
              Book airport-ready rentals and browse locally hosted car sharing vehicles — all with transparent pricing, secure payments, and trip protection.
            </p>
            <div className={styles.heroPills}>
              {marketingPillars.map((pill) => (
                <span key={pill} className={styles.heroPill}>{pill}</span>
              ))}
            </div>
            <div className={styles.heroNarrativeCard}>
              <span className={styles.heroNarrativeLabel}>Guest-first storefront</span>
              <p className={styles.heroNarrativeBody}>
                Replace the old booking-widget feel with a calmer arrival story: clearer pricing, clearer pickup expectations, and a more premium path into checkout.
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
                Explore rentals
              </Link>
              <Link href={withSiteBase(basePath, '/car-sharing')} className={styles.heroSecondaryAction} style={{ textDecoration: 'none' }}>
                Browse car sharing
              </Link>
            </div>
            <div className={styles.heroDestinations}>
              <span className={styles.heroDestinationsLabel}>Now serving</span>
              <div className={styles.heroDestinationList}>{destinationStory.join(' | ')}</div>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroShowcase}>
              <div className={styles.heroShowcaseTopline}>Signature launch direction</div>
              <h3 className={styles.heroShowcaseTitle}>Make the first screen feel like premium mobility hospitality.</h3>
              <div className={styles.heroBannerFrame}>
                <Image
                  src="/brand/ride-banner-facebook-cover.jpg"
                  alt="Fast lane, bold ride."
                  width={960}
                  height={540}
                  className={styles.heroBannerImage}
                />
                <div className={styles.heroBannerOverlay}>
                  <span className={styles.heroBannerEyebrow}>Fast lane, bold ride.</span>
                  <strong>Airport-ready rentals with a more guided digital handoff.</strong>
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

      <section className={styles.motionRibbon} aria-label="Brand trust signals">
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
            <span className="eyebrow">Prestige Positioning</span>
            <h2 id="prestige-positioning-title" style={{ margin: 0 }}>Turn the storefront into part of the premium arrival experience.</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Feel the difference before you even compare rates. Airport readiness, trust, and premium mobility from the first moment.
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
            <div className={styles.editorialShowTopline}>Curated guest cues</div>
            <div className={styles.editorialPerkGrid}>
              {curatedPerks.map((perk) => (
                <div key={perk} className={styles.editorialPerkCard}>
                  <span className={styles.motionDot} />
                  <strong>{perk}</strong>
                </div>
              ))}
            </div>
            <div className={styles.editorialShowFooter}>
              <span className="label">Website direction</span>
              <strong>Luxury mobility aesthetic with professional operational confidence</strong>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.trustBand} aria-labelledby="trust-layer-title">
        <div className={`glass card-lg ${styles.trustPanel}`}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">Trust Layer</span>
            <h2 id="trust-layer-title" style={{ margin: 0 }}>Make the website feel confident before the guest even searches</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Trust is built into every step — airport clarity, secure payments, and a smooth digital experience from search to pickup.
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
              <div className="label" style={{ color: 'rgba(246,248,255,0.76)' }}>Guest Journey</div>
              <h3 style={{ margin: '8px 0 10px', fontSize: '1.55rem' }}>Modern booking flow</h3>
              <div className={styles.showcaseRow}>
                {guestJourneySignals.map((item) => (
                  <span key={item} className={styles.showcaseChip}>{item}</span>
                ))}
              </div>
            </div>
            <div className={styles.showcaseCardSecondary}>
              <div className="label">Guest promise</div>
              <h3 style={{ margin: '8px 0 10px' }}>Search, checkout, and pickup — one calm experience</h3>
              <p className="ui-muted" style={{ margin: 0 }}>
                Pricing, pickup expectations, and next steps are clear before you ever reach the payment screen.
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
          <span className="eyebrow">Prestige Layer</span>
          <h2 style={{ margin: 0 }}>Make the storefront feel like a premium travel brand, not just a booking page</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            Modern hospitality meets premium mobility: clean design, rich details, and subtle confidence in every interaction.
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
            <span className={styles.laneBadge}>Guest Lane</span>
            <h2 className={styles.laneTitle}>Traditional Rentals</h2>
            <p className={styles.laneLead}>
              Search real locations and send guests into live rental availability, pricing, and checkout.
            </p>
          </div>
          <label className="label">Pickup location</label>
          <select value={rentalSearch.pickupLocationId} onChange={(e) => setRentalSearch((current) => ({ ...current, pickupLocationId: e.target.value }))}>
            <option value="">Select location</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <label className="label">Return location</label>
          <select value={rentalSearch.returnLocationId} onChange={(e) => setRentalSearch((current) => ({ ...current, returnLocationId: e.target.value }))}>
            <option value="">Select location</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <div className="grid2">
            <div className="stack">
              <label className="label">Pickup</label>
              <input type="datetime-local" value={rentalSearch.pickupAt} onChange={(e) => setRentalSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
            </div>
            <div className="stack">
              <label className="label">Return</label>
              <input type="datetime-local" value={rentalSearch.returnAt} onChange={(e) => setRentalSearch((current) => ({ ...current, returnAt: e.target.value }))} />
            </div>
          </div>
          <button type="button" className="ios-action-btn" onClick={openRental} disabled={busy === 'rental'}>
            {busy === 'rental' ? 'Opening...' : 'Search Rentals'}
          </button>
        </div>

        <div className={`glass card ${styles.laneCard}`}>
          <div className={styles.laneHeader}>
            <span className={styles.laneBadge}>Guest Lane</span>
            <h2 className={styles.laneTitle}>Car Sharing</h2>
            <p className={styles.laneLead}>
              Browse the car sharing marketplace with curated listings, verified hosts, and trip protection on every booking.
            </p>
          </div>
          <label className="label">Location</label>
          <select value={carSharingSearch.locationId} onChange={(e) => setCarSharingSearch((current) => ({ ...current, locationId: e.target.value }))}>
            <option value="">Select location</option>
            {publicLocationOptions.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
          <div className="grid2">
            <div className="stack">
              <label className="label">Pickup</label>
              <input type="datetime-local" value={carSharingSearch.pickupAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, pickupAt: e.target.value }))} />
            </div>
            <div className="stack">
              <label className="label">Return</label>
              <input type="datetime-local" value={carSharingSearch.returnAt} onChange={(e) => setCarSharingSearch((current) => ({ ...current, returnAt: e.target.value }))} />
            </div>
          </div>
          <button type="button" className="ios-action-btn" onClick={openCarSharing} disabled={busy === 'carsharing'}>
            {busy === 'carsharing' ? 'Opening...' : 'Search Car Sharing'}
          </button>
        </div>
      </section>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <section className="glass card-lg" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>Recent Searches</h2>
            <button onClick={() => { clearSavedSearches(); setRecentSearches([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontSize: '0.78rem', fontWeight: 600 }}>Clear all</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recentSearches.map((s) => (
              <Link
                key={s.id}
                href={withSiteBase(basePath, s.mode === 'CAR_SHARING' ? `/car-sharing?locationId=${encodeURIComponent(s.locationId)}&pickupAt=${encodeURIComponent(s.pickupAt)}&returnAt=${encodeURIComponent(s.returnAt)}` : `/rent?pickupLocationId=${encodeURIComponent(s.locationId)}&returnLocationId=${encodeURIComponent(s.locationId)}&pickupAt=${encodeURIComponent(s.pickupAt)}&returnAt=${encodeURIComponent(s.returnAt)}`)}
                style={{ flex: '0 0 auto', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(135,82,254,.1)', background: 'rgba(135,82,254,.03)', textDecoration: 'none', display: 'grid', gap: 2, minWidth: 180 }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6e49ff', textTransform: 'uppercase' }}>{s.mode === 'CAR_SHARING' ? 'Car Sharing' : 'Rental'}</span>
                <span style={{ fontWeight: 600, color: '#1e2847', fontSize: '0.88rem' }}>{s.locationLabel || 'Search'}</span>
                {s.pickupAt && <span style={{ fontSize: '0.76rem', color: '#6b7a9a' }}>{new Date(s.pickupAt).toLocaleDateString()}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.destinationRail}>
        {destinationPanels.map((panel, index) => (
          <article key={panel.city} className={`glass card ${styles.destinationCard}`} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="label">Destination</div>
            <h3 style={{ margin: '8px 0 8px' }}>{panel.city}</h3>
            <p className="ui-muted" style={{ margin: 0 }}>{panel.note}</p>
          </article>
        ))}
      </section>

      <section className={styles.conciergeSplit}>
        <div className={`glass card-lg ${styles.conciergeStage}`}>
          <div className={styles.conciergeVisualGlow} />
          <div className={styles.conciergeCopy}>
            <span className="eyebrow">Concierge Positioning</span>
            <h2 style={{ margin: 0 }}>Premium mobility hospitality — not just another booking page.</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              The website needs to look advanced enough that the guest trusts the trip before they compare prices. Strong visuals, subtle motion, and clearer journey cues are what make the storefront feel prestigious.
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
            <div className={styles.conciergeShowTopline}>Signature storefront direction</div>
            <div className={styles.conciergeShowStats}>
              <div className={styles.conciergeStatCard}>
                <span className="label">Guest feel</span>
                <strong>Premium, calm, guided</strong>
              </div>
              <div className={styles.conciergeStatCard}>
                <span className="label">Operational truth</span>
                <strong>Professional operations behind every trip</strong>
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
          <span className="eyebrow">Signature Experience</span>
          <h2 style={{ margin: 0 }}>Make the website feel like concierge-grade mobility retail</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            Blend premium travel cues, calmer hierarchy, and stronger checkout trust so the brand feels elevated before the guest even compares rates.
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
            <span className="eyebrow">Social Proof Direction</span>
            <h2 style={{ margin: 0 }}>A premium experience you can trust</h2>
          </div>
          <div className={styles.testimonialBadge}>Premium travel + trusted operations</div>
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
          <span className="eyebrow">Airport Pickup Story</span>
          <h2 style={{ margin: 0 }}>Show what happens next before the guest ever asks</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            The strongest storefront explains pickup, payment trust, and digital readiness as part of the experience, not as support copy the guest has to go hunt for.
          </p>
        </div>
        <div className={styles.journeyGrid}>
          <div className={styles.timelineRail}>
            {airportJourney.map((step, index) => (
              <div key={step.title} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>{index + 1}</div>
                <div className={styles.timelineContent}>
                  <div className="label">Step {index + 1}</div>
                  <h3 style={{ margin: '6px 0 8px' }}>{step.title}</h3>
                  <p className="ui-muted" style={{ margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.airportCanvas}>
            <div className={styles.airportGlow} />
            <div className={styles.airportBoard}>
              <div className={styles.boardTopline}>Ride Car Sharing Arrival Flow</div>
              <div className={styles.boardStage}>
                <span className={styles.boardLabel}>Pickup mode</span>
                <strong>Airport staging + digital handoff</strong>
              </div>
              <div className={styles.boardRow}>
                <div className={styles.boardCard}>
                  <span className="label">Due now</span>
                  <strong>{fmtMoney(bootstrap?.featuredCarSharingListings?.[0]?.baseDailyRate || 49)}</strong>
                  <p className="ui-muted" style={{ margin: '8px 0 0' }}>Secure payment details and pricing clarity before you confirm your booking.</p>
                </div>
                <div className={styles.boardCard}>
                  <span className="label">Pickup promise</span>
                  <strong>Digital instructions</strong>
                  <p className="ui-muted" style={{ margin: '8px 0 0' }}>Show branch timing, required docs, and where to go on arrival.</p>
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
          <span className="eyebrow">Premium Moments</span>
          <h2 style={{ margin: 0 }}>Turn the storefront into part of the product</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            Every detail is polished so you feel confident before you ever reach the payment screen.
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
            <span className="eyebrow">How It Works</span>
            <h2 style={{ margin: 0 }}>A simple guest journey from search to pickup</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Real-time availability, detailed vehicle pages, and one clean checkout path from search to confirmation.
            </p>
          </div>
            <Link href={withSiteBase(basePath, '/checkout')} className="button-subtle" style={{ textDecoration: 'none' }}>
              See checkout flow
            </Link>
        </div>
        <div className="metric-grid">
          {marketingMoments.map((item, index) => (
            <div key={item.title} className={styles.processCard}>
              <div className="label">Step {index + 1}</div>
              <h3 style={{ margin: '8px 0 6px' }}>{item.title}</h3>
              <p className="ui-muted" style={{ margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`glass card-lg ${styles.checkoutSection}`}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div className="stack" style={{ gap: 8, maxWidth: 780 }}>
            <span className="eyebrow">Guided Reservation Flow</span>
            <h2 style={{ margin: 0 }}>One premium reservation flow, two distinct guest journeys</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Rentals and car sharing each have their own experience, but both run through the same trusted reservation and payment system.
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
              Preview reservation flow
            </Link>
        </div>
        <div className={styles.checkoutGrid}>
          <div className={styles.checkoutCard}>
            <span className="label">Rental lane</span>
            <strong>Search {'->'} detail {'->'} reserve</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">Car sharing lane</span>
            <strong>Catalog {'->'} listing {'->'} reserve</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">Trusted system</span>
            <strong>Professional reservation management</strong>
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
          <span className="eyebrow">Launch-ready direction</span>
          <h2 style={{ margin: 0 }}>A premium booking experience that matches the quality of the ride.</h2>
          <p className="ui-muted" style={{ margin: 0 }}>
            The goal is to make the public booking experience polished enough that moving the main domain feels like an infrastructure switch, not a redesign under pressure.
          </p>
        </div>
        <div className={styles.launchFinaleActions}>
          <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>
            Explore rental journey
          </Link>
          <Link href={withSiteBase(basePath, '/car-sharing')} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Explore car sharing journey
          </Link>
        </div>
      </section>

      <section className={styles.splitFeature}>
        <div className={`glass card ${styles.editorialPanel}`}>
          <span className="eyebrow">Learn More About Us</span>
          <h2 style={{ margin: '8px 0 10px' }}>Reframe the current marketing around trust, clarity, and convenience</h2>
          <p className="ui-muted">
            Keep the core story of affordability, airport access, and contactless convenience, but package it in a cleaner visual system with a more modern booking flow.
          </p>
          <div className="stack" style={{ gap: 12 }}>
            <div className="surface-note">
              <strong>Browse &amp; Book</strong>
              <div className="ui-muted">Browse real vehicle classes and featured car sharing listings with live availability.</div>
            </div>
            <div className="surface-note">
              <strong>Pickup &amp; Go</strong>
              <div className="ui-muted">Spotlight airport staging, digital agreements, and quick inspections without adding friction to checkout.</div>
            </div>
            <div className="surface-note">
              <strong>Explore &amp; Return</strong>
              <div className="ui-muted">Professional workflow for returns, receipts, and customer follow-up.</div>
            </div>
          </div>
        </div>

      </section>

      <section className={styles.spotlightGrid}>
        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Live Locations</span>
              <h3 style={{ margin: '6px 0 0' }}>Airport and city pickup hubs</h3>
            </div>
            <Link href={withSiteBase(basePath, '/fleet')} className="button-subtle" style={{ textDecoration: 'none' }}>View fleet</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedLocations.length ? highlightedLocations.map((location) => (
              <div key={location.id} className="surface-note">
                <strong>{location.name}</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
            )) : <div className="ui-muted">No pickup locations available right now.</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Rental Classes</span>
              <h3 style={{ margin: '6px 0 0' }}>Available vehicle classes</h3>
            </div>
            <Link href={withSiteBase(basePath, '/rent')} className="button-subtle" style={{ textDecoration: 'none' }}>Search rentals</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedVehicleTypes.length ? highlightedVehicleTypes.map((vehicleType) => (
              <div key={vehicleType.id} className="surface-note">
                <strong>{vehicleTypeLabel(vehicleType)}</strong>
                <div className="ui-muted">{vehicleType.code || 'Rental class'}</div>
              </div>
            )) : <div className="ui-muted">No vehicle classes available right now.</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Car Sharing Catalog</span>
              <h3 style={{ margin: '6px 0 0' }}>Featured car sharing vehicles</h3>
            </div>
            <Link href={withSiteBase(basePath, '/car-sharing')} className="button-subtle" style={{ textDecoration: 'none' }}>Open catalog</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedListings.length ? highlightedListings.map((listing) => (
              <div key={listing.id} className="surface-note">
                <strong>{listing.title || listingVehicleLabel(listing)}</strong>
                <div className="ui-muted">
                  {publicLocationLabel(listing.location)}{Number(listing.baseDailyRate || 0) ? ` | From ${fmtMoney(listing.baseDailyRate)}/day` : ''}
                </div>
              </div>
            )) : <div className="ui-muted">No featured listings available right now.</div>}
          </div>
        </div>
      </section>

    </div>
  );
}
