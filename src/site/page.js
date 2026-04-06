'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../lib/client';
import Link from 'next/link';
import { addDays, buildUnifiedCheckoutQuery, fmtMoney, listingVehicleLabel, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from './sitePreviewShared';
import styles from './sitePreviewPremium.module.css';

const heroStats = [
  { value: '24/7', label: 'Guest-first booking access' },
  { value: '2 lanes', label: 'Rentals plus car sharing' },
  { value: '1 flow', label: 'Unified payment and portal handoff' }
];

const heroFeatureCards = [
  {
    label: 'Airport-first arrival',
    title: 'Pickup instructions, payment trust, and digital readiness surface earlier',
    body: 'The public side should feel closer to premium travel checkout than a plugin layered on top of operations.'
  },
  {
    label: 'One connected system',
    title: 'Rentals and car sharing can feel distinct without splitting the backend',
    body: 'Ride Fleet still owns reservations, payments, agreements, and inspections while the storefront feels more curated.'
  }
];

const phases = [
  'Stand up a public-facing shell that can live on a beta subdomain without touching the current WordPress production site.',
  'Connect rental search and checkout to Ride Fleet APIs while reusing the existing public booking and payment machinery.',
  'Build a distinct car sharing UX on top of the same backend so both products live under one branded website.'
];

const marketingMoments = [
  {
    title: 'Search your ride',
    body: 'Explore vehicle classes, pickup hubs, and car sharing listings without waiting on a WordPress booking widget to catch up.'
  },
  {
    title: 'Reserve with confidence',
    body: 'Keep the operational logic inside Ride Fleet while the public website tells a clearer pricing, pickup, and trust story.'
  },
  {
    title: 'Pick up and go',
    body: 'Support airport staging, complimentary shuttle pickup, and digital inspections without splitting the guest journey from the ops workflow.'
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
    body: 'Bring pickup instructions, branch context, and due-now clarity higher in the journey.'
  },
  {
    title: 'Hosted payments',
    body: 'Keep payment trust high with the same Authorize.Net flow already working inside Ride Fleet.'
  },
  {
    title: 'Digital readiness',
    body: 'Customer info, agreement, inspections, and payment follow-up stay connected to the operational backend.'
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
    body: 'Sell convenience from the first screen with airport staging, pickup timing, and clearer guest expectations.'
  },
  {
    title: 'Built for trust',
    body: 'Use product-style detail pages and cleaner due-now messaging so guests commit faster.'
  },
  {
    title: 'Powered by operations',
    body: 'Everything still lands in Ride Fleet, so the public website can look premium without losing the real backend truth.'
  }
];

const reviewMoments = [
  {
    quote: 'The website should feel like airport hospitality meets premium mobility tech, not a stitched-together booking plugin.',
    author: 'Guest experience direction',
    score: '4.9/5 trust target'
  },
  {
    quote: 'Rentals and car sharing can absolutely live together if the interface separates the stories while keeping one trusted checkout backbone.',
    author: 'Product strategy',
    score: '2-booking-lane model'
  },
  {
    quote: 'Payment, agreement, and pickup expectations should feel obvious before the guest ever calls support.',
    author: 'Operations readiness',
    score: 'Lower support friction'
  }
];

const airportJourney = [
  {
    title: 'Choose the trip',
    body: 'Start with a polished storefront that makes location, pricing, and trip mode feel obvious from the first screen.'
  },
  {
    title: 'Confirm pickup',
    body: 'Surface airport staging, shuttle details, and digital readiness before the guest reaches checkout.'
  },
  {
    title: 'Unlock the trip',
    body: 'Hand off to hosted payments, customer portal tasks, and inspection-backed pickup without losing the premium feel.'
  }
];

const launchSignals = [
  'Airport-first Puerto Rico flow',
  'Hosted payments with cleaner trust cues',
  'Marketplace visuals without ops fragmentation',
  'Ready for a polished public launch'
];

const prestigeSignals = [
  {
    title: 'Hospitality-grade trust',
    body: 'Blend premium travel language with operational clarity so the brand feels elevated before checkout.'
  },
  {
    title: 'Story-led merchandising',
    body: 'Every vehicle class, listing, and pickup touchpoint should feel curated instead of dumped from a booking engine.'
  },
  {
    title: 'Launch-ready motion',
    body: 'Use restrained animation, glow, and layered gradients to make the site feel advanced without becoming noisy.'
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
    title: 'A storefront that feels merchandised, not exported',
    body: 'Use richer class storytelling, featured listings, and clearer pickup language so the guest feels guided instead of dumped into a booking tool.'
  },
  {
    label: 'Arrival confidence',
    title: 'Airport mobility with hospitality cues',
    body: 'Blend arrival instructions, branch timing, and due-now reassurance into the core visual system so pickup feels premium before the guest lands.'
  },
  {
    label: 'One trusted system',
    title: 'Luxury presentation backed by real operations',
    body: 'Keep the polished public face while every booking, payment, inspection, and follow-up continues to land inside Ride Fleet.'
  }
];

const testimonialRibbon = [
  {
    quote: 'Feels more like premium travel tech than a rental plugin.',
    author: 'Launch direction'
  },
  {
    quote: 'The airport story is clearer, calmer, and easier to trust.',
    author: 'Guest journey review'
  },
  {
    quote: 'One website can sell both rentals and car sharing if the design feels curated.',
    author: 'Product strategy'
  }
];

const prestigeTicker = [
  'Airport-first guest experience',
  'Hosted Authorize.Net trust flow',
  'Puerto Rico to Miami launch story',
  'Marketplace-style car sharing',
  'Digital agreements and inspections',
  'Premium storefront, real ops backbone'
];

const conciergeMoments = [
  {
    label: 'Arrival-first design',
    title: 'A homepage that sells confidence before the search',
    body: 'The strongest version of Ride should feel like premium travel retail: polished, calm, and unmistakably operationally ready.'
  },
  {
    label: 'Concierge clarity',
    title: 'Pickup, payment, and support cues should feel curated',
    body: 'Guests should understand where they will go, what they owe, and how the trip works before they ever need to call or message the team.'
  }
];

const prestigeEditorialMoments = [
  {
    label: 'Signature feel',
    title: 'A calmer, richer first impression',
    body: 'The interface should feel like premium mobility hospitality, not a transactional booking widget.'
  },
  {
    label: 'Operational clarity',
    title: 'Airport-ready journeys with less guesswork',
    body: 'Pickup cues, payment trust, and arrival expectations should feel built into the design language.'
  }
];

const curatedPerks = [
  'Guided airport arrival story',
  'Hosted payment reassurance',
  'Digital agreement and portal continuity',
  'One storefront for rentals and car sharing'
];

const unifiedCheckoutSignals = [
  'Real Ride Fleet pricing and reservation creation',
  'Hosted payment trust carried into the portal',
  'One digital handoff for documents, agreements, and pickup'
];

export default function SitePreviewHomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [bootstrap, setBootstrap] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
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
    const firstLocationId = bootstrap?.locations?.[0]?.id || '';
    if (!firstLocationId) return;
    setRentalSearch((current) => ({
      ...current,
      pickupLocationId: current.pickupLocationId || firstLocationId,
      returnLocationId: current.returnLocationId || firstLocationId
    }));
    setCarSharingSearch((current) => ({
      ...current,
      locationId: current.locationId || firstLocationId
    }));
  }, [bootstrap]);

  const locations = Array.isArray(bootstrap?.locations) ? bootstrap.locations : [];
  const vehicleTypes = Array.isArray(bootstrap?.vehicleTypes) ? bootstrap.vehicleTypes : [];
  const featuredListings = Array.isArray(bootstrap?.featuredCarSharingListings) ? bootstrap.featuredCarSharingListings : [];
  const highlightedLocations = locations.slice(0, 3);
  const highlightedVehicleTypes = vehicleTypes.slice(0, 4);
  const highlightedListings = featuredListings.slice(0, 3);

  const openRental = () => {
    if (!rentalSearch.pickupLocationId || !rentalSearch.returnLocationId) {
      return setError('Choose pickup and return locations before searching rentals.');
    }
    setBusy('rental');
    setError('');
    router.push(`${withSiteBase(basePath, '/rent')}?${searchParamsToString(rentalSearch)}`);
  };

  const openCarSharing = () => {
    if (!carSharingSearch.locationId) {
      return setError('Choose a location before searching car sharing.');
    }
    setBusy('carsharing');
    setError('');
    router.push(`${withSiteBase(basePath, '/car-sharing')}?${searchParamsToString(carSharingSearch)}`);
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={styles.heroShell}>
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
            <h1 className={styles.heroTitle}>
              Affordable rentals, car sharing, and a smoother guest journey on top of Ride Fleet.
            </h1>
            <p className={styles.heroLead}>
              Book airport-ready rentals and marketplace-style car sharing through a more curated storefront that still preserves the real Ride Fleet operational backbone underneath.
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

      <section className={styles.editorialSplit}>
        <article className={`glass card-lg ${styles.editorialFeatureCard}`}>
          <div className={styles.editorialFeatureGlow} />
          <div className={styles.editorialFeatureCopy}>
            <span className="eyebrow">Prestige Positioning</span>
            <h2 style={{ margin: 0 }}>Turn the storefront into part of the premium arrival experience.</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Guests should feel the difference before they even compare rates. The visual system needs to signal airport readiness, trust, and calmer premium mobility from the first fold.
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
              <strong>Luxury mobility aesthetic with real Ride Fleet backend confidence</strong>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.trustBand}>
        <div className={`glass card-lg ${styles.trustPanel}`}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">Trust Layer</span>
            <h2 style={{ margin: 0 }}>Make the website feel confident before the guest even searches</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              The best public booking sites make trust feel built in. This one should do it with airport clarity, hosted payments, and a cleaner digital handoff.
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
              <h3 style={{ margin: '8px 0 10px' }}>Search, checkout, and pickup should feel like one calm experience</h3>
              <p className="ui-muted" style={{ margin: 0 }}>
                The storefront should make pricing, pickup expectations, and next steps feel obvious before the guest ever reaches payment.
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
            The strongest version of this website should feel closer to modern hospitality tech: cleaner hierarchy, richer storytelling, and subtle motion that signals confidence.
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
            {locations.map((location) => <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>)}
          </select>
          <label className="label">Return location</label>
          <select value={rentalSearch.returnLocationId} onChange={(e) => setRentalSearch((current) => ({ ...current, returnLocationId: e.target.value }))}>
            <option value="">Select location</option>
            {locations.map((location) => <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>)}
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
              Search the marketplace-style supply with a warmer listing story and the same trusted booking engine underneath.
            </p>
          </div>
          <label className="label">Location</label>
          <select value={carSharingSearch.locationId} onChange={(e) => setCarSharingSearch((current) => ({ ...current, locationId: e.target.value }))}>
            <option value="">Select location</option>
            {locations.map((location) => <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>)}
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

      <section className={styles.destinationRail}>
        {destinationPanels.map((panel, index) => (
          <article key={panel.city} className={`glass card ${styles.destinationCard}`} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="label">Launch city</div>
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
            <h2 style={{ margin: 0 }}>This should feel closer to premium mobility hospitality than a booking widget.</h2>
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
                <strong>Ride Fleet stays underneath</strong>
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
            <h2 style={{ margin: 0 }}>Prestige should feel earned, not decorative</h2>
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
                  <p className="ui-muted" style={{ margin: '8px 0 0' }}>Hosted payment trust language should appear before the portal handoff.</p>
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
            This is bigger than wiring APIs. The public side should feel polished enough that trust is built before the guest ever reaches a payment screen.
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
            <h2 style={{ margin: 0 }}>Keep the guest journey simple and the ops handoff invisible</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              The current site already promises a smooth reservation flow. The new one should finally deliver it with real availability, stronger product pages, and one cleaner checkout path.
            </p>
          </div>
          <Link href={withSiteBase(basePath, '/checkout')} className="button-subtle" style={{ textDecoration: 'none' }}>
            See unified checkout
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
            <span className="eyebrow">Unified Checkout</span>
            <h2 style={{ margin: 0 }}>One premium checkout path, two distinct guest journeys</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              Rentals and car sharing should feel distinct on the storefront while still handing into one trusted operational checkout engine underneath.
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
            Preview unified checkout
          </Link>
        </div>
        <div className={styles.checkoutGrid}>
          <div className={styles.checkoutCard}>
            <span className="label">Rental lane</span>
            <strong>Search {'->'} detail {'->'} checkout</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">Car sharing lane</span>
            <strong>Catalog {'->'} listing {'->'} checkout</strong>
          </div>
          <div className={styles.checkoutCard}>
            <span className="label">Shared ops core</span>
            <strong>Ride Fleet reservation APIs</strong>
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
          <h2 style={{ margin: 0 }}>Build the new public site so the brand already feels established.</h2>
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
              <div className="ui-muted">Show real vehicle classes and featured car sharing listings pulled from Ride Fleet.</div>
            </div>
            <div className="surface-note">
              <strong>Pickup &amp; Go</strong>
              <div className="ui-muted">Spotlight airport staging, digital agreements, and quick inspections without adding friction to checkout.</div>
            </div>
            <div className="surface-note">
              <strong>Explore &amp; Return</strong>
              <div className="ui-muted">Use the same ops-backed workflow for returns, receipts, and customer follow-up.</div>
            </div>
          </div>
        </div>

        <div className={`glass card ${styles.editorialPanel}`}>
          <span className="eyebrow">Go-live recommendation</span>
          <h2 style={{ margin: '8px 0 10px' }}>Soft-launch the new storefront before the main domain switch</h2>
          <p className="ui-muted">
            The safest path is to validate search, checkout, payments, and portal links in a soft-launch environment first, then move the main domain once the guest journey is fully proven.
          </p>
          <div className="stack" style={{ gap: 10 }}>
            <div className="surface-note">
              <strong>Phase A</strong>
              <div className="ui-muted">Keep WordPress live on the main domain while the new storefront is validated in a protected rollout environment.</div>
            </div>
            <div className="surface-note">
              <strong>Phase B</strong>
              <div className="ui-muted">Move internal testing, support scripts, and selected traffic into the new storefront to validate the real guest journey.</div>
            </div>
            <div className="surface-note">
              <strong>Phase C</strong>
              <div className="ui-muted">Cut over the main domain after checkout, payments, and customer portal flows are proven end to end.</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.spotlightGrid}>
        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Live Locations</span>
              <h3 style={{ margin: '6px 0 0' }}>Pickup hubs ready for the public site</h3>
            </div>
            <Link href={withSiteBase(basePath, '/fleet')} className="button-subtle" style={{ textDecoration: 'none' }}>View fleet</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedLocations.length ? highlightedLocations.map((location) => (
              <div key={location.id} className="surface-note">
                <strong>{location.name}</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
            )) : <div className="ui-muted">Locations will appear here once bootstrap data loads.</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Rental Classes</span>
              <h3 style={{ margin: '6px 0 0' }}>Vehicle types from Ride Fleet</h3>
            </div>
            <Link href={withSiteBase(basePath, '/rent')} className="button-subtle" style={{ textDecoration: 'none' }}>Search rentals</Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {highlightedVehicleTypes.length ? highlightedVehicleTypes.map((vehicleType) => (
              <div key={vehicleType.id} className="surface-note">
                <strong>{vehicleTypeLabel(vehicleType)}</strong>
                <div className="ui-muted">{vehicleType.code || 'Rental class'}</div>
              </div>
            )) : <div className="ui-muted">Vehicle classes will appear here once bootstrap data loads.</div>}
          </div>
        </div>

        <div className={`glass card ${styles.spotlightCard}`}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="eyebrow">Car Sharing Catalog</span>
              <h3 style={{ margin: '6px 0 0' }}>Featured listings from the API</h3>
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
            )) : <div className="ui-muted">Featured car sharing listings will appear here once bootstrap data loads.</div>}
          </div>
        </div>
      </section>

      <section className="glass card-lg" style={{ padding: 28 }}>
        <div className="row-between" style={{ alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 700 }}>
            <span className="eyebrow">Execution Phases</span>
            <h2 style={{ margin: 0 }}>What we build next on this branch</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              The first goal is to create a polished public shell and then progressively connect real Ride Fleet booking flows.
            </p>
          </div>
        </div>
        <div className="stack" style={{ gap: 12, marginTop: 18 }}>
          {phases.map((phase, index) => (
            <div key={phase} className="glass card" style={{ padding: 18 }}>
              <div className="label">Phase {index + 1}</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{phase}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
