'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/client';
import { addDays, backendLocationIdsForPublicOption, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fetchBookingBootstrap, fmtMoney, formatPublicDateTime, listingVehicleLabel, normalizeImageList, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, withSiteBase } from '../../sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

function CarSharingDetailPreviewContent() {
  const params = useParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const searchParams = useSearchParams();
  const listingId = String(params?.listingId || '');
  const [bootstrap, setBootstrap] = useState(null);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const locationId = String(searchParams.get('locationId') || '');
  const pickupAt = String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1)));
  const returnAt = String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 2)));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const boot = await fetchBookingBootstrap();
        setBootstrap(boot);
        const publicLocationOptions = buildPublicLocationOptions(boot?.locations || []);
        const firstLocationId = publicLocationOptions[0]?.id || '';
        const locationIds = backendLocationIdsForPublicOption(publicLocationOptions, locationId || firstLocationId);
        if (!locationIds.length) {
          throw new Error('Pickup location not found');
        }
        const payload = await api('/api/public/booking/car-sharing-search', {
          method: 'POST',
          body: JSON.stringify({
            locationId: locationIds[0],
            locationIds,
            pickupAt,
            returnAt
          })
        });
        const match = (payload?.results || []).find((entry) => String(entry?.id || '') === listingId)
          || (boot?.featuredCarSharingListings || []).find((entry) => String(entry?.id || '') === listingId)
          || null;
        setListing(match);
        if (!match) {
          setError('This car sharing listing is not currently available for the selected trip window.');
        } else {
          setError('');
        }
      } catch (err) {
        setListing(null);
        setError(String(err?.message || 'Unable to load car sharing listing.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId, locationId, pickupAt, returnAt]);

  const gallery = normalizeImageList(listing?.imageUrls?.length ? listing.imageUrls : listing?.primaryImageUrl ? [listing.primaryImageUrl] : []);
  const location = listing?.location || bootstrap?.locations?.find((entry) => String(entry.id) === String(locationId)) || null;
  const checkoutQuery = buildUnifiedCheckoutQuery({
    searchMode: 'CAR_SHARING',
    locationId: listing?.location?.id || locationId,
    pickupAt,
    returnAt,
    listingId
  });
  const backQuery = searchParamsToString({
    locationId,
    pickupAt,
    returnAt
  });
  const sharingExperience = [
    { title: 'Host-led personality', body: 'The listing page should feel warmer and more editorial than standard fleet search.' },
    { title: 'Luxury tech handoff', body: 'Guests should feel they are moving from discovery into a premium, trusted checkout flow.' },
    { title: 'Unified backend', body: 'It still lands in the same booking engine without feeling operationally generic.' }
  ];
  const listingHighlights = [
    'Editorial listing presentation',
    'Marketplace personality with trusted checkout',
    'Ride Fleet-backed booking confidence'
  ];
  const listingProofSignals = [
    'Host-style storytelling',
    'Curated listing detail',
    'Trusted hosted payment handoff'
  ];
  const nextSteps = [
    'Confirm listing fit and trip timing',
    'Review hosted checkout and due-now amount',
    'Complete documents and pickup tasks in one connected flow'
  ];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <div className={styles.detailHeroGrid}>
          <div className="stack" style={{ gap: 12 }}>
            <span className="eyebrow">Car Sharing Detail</span>
            <h1 className={styles.detailTitle}>{listing?.title || listingVehicleLabel(listing)}</h1>
            <p className={styles.detailLead}>
              A warmer, more editorial listing page that explains the vehicle, pickup story, and pricing before guiding the guest into a clear reservation flow.
            </p>
            <div className={styles.detailRibbon}>
              <span className={styles.detailRibbonChip}>Marketplace feel</span>
              <span className={styles.detailRibbonChip}>Host-style listing detail</span>
              <span className={styles.detailRibbonChip}>Trusted reservation handoff</span>
            </div>
            <div className={styles.highlightStrip}>
              {listingHighlights.map((item) => (
                <span key={item} className={styles.highlightChip}>{item}</span>
              ))}
            </div>
          </div>
          <div className={styles.detailSnapshot}>
            <div className="label">Trip Snapshot</div>
            <div className={styles.detailSnapshotValue}>{formatPublicDateTime(pickupAt)}</div>
            <div className="ui-muted" style={{ marginTop: 6 }}>Return {formatPublicDateTime(returnAt)}</div>
            <div className="ui-muted" style={{ marginTop: 16 }}>{publicLocationLabel(location)}</div>
            <div className={styles.snapshotAccent}>
              <span className="label">Marketplace posture</span>
              <strong>Warm host-led story with one trusted booking backbone</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailGrid}>
        <div className={`glass card ${styles.contentPanel}`}>
          {loading ? <div className="ui-muted">Loading listing...</div> : null}
          {!loading && error ? <div className="label" style={{ color: '#b91c1c' }}>{error}</div> : null}
          {!loading && listing ? (
            <div className="stack" style={{ gap: 16 }}>
              {gallery[0] ? (
                <div className={styles.galleryFrame}>
                  <Image
                    src={gallery[0]}
                    alt={listing?.title || listingVehicleLabel(listing)}
                    className={styles.galleryImage}
                    width={1200}
                    height={675}
                    sizes="(max-width: 960px) 100vw, 720px"
                    priority
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="surface-note">
                <strong>Location</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
              <div className={styles.storyCard}>
                <div className="label">Listing story</div>
                <h3 style={{ margin: '8px 0 10px' }}>More editorial, more local, more host-led</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  Car sharing should feel more personal and more curated than daily rentals while still ending in the same trusted reservation flow.
                </p>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <span className="label">Daily rate</span>
                  <strong>{fmtMoney(listing?.quote?.baseRate || listing?.baseDailyRate)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Trip total</span>
                  <strong>{fmtMoney(listing?.quote?.total || listing?.quote?.pickupTotal || listing?.quote?.deliveryTotal || listing?.baseDailyRate)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Trip window</span>
                  <strong>{formatPublicDateTime(pickupAt)}</strong>
                </div>
              </div>
              {listing?.shortDescription ? (
                <div className="surface-note">
                  <strong>Listing summary</strong>
                  <div className="ui-muted">{listing.shortDescription}</div>
                </div>
              ) : null}
              <div className="surface-note">
                <strong>Why this listing page matters</strong>
                <div className="ui-muted">
                  Car sharing needs a warmer, more editorial product page than daily rentals, but it still has to hand the guest into a reservation flow that feels just as trustworthy.
                </div>
              </div>
              <div className={styles.highlightStrip}>
                {listingProofSignals.map((item) => (
                  <span key={item} className={styles.highlightChip}>{item}</span>
                ))}
              </div>
              <div className={styles.experiencePanel}>
                <div className="label">Listing Experience</div>
                <div className={styles.experienceGrid} style={{ marginTop: 12 }}>
                  {sharingExperience.map((item) => (
                    <div key={item.title} className={styles.experienceTile}>
                      <strong>{item.title}</strong>
                      <p className="ui-muted" style={{ margin: '8px 0 0' }}>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.conciergePanel}>
                <div className="label">Marketplace narrative</div>
                <h3 style={{ margin: '8px 0 10px' }}>Sell personality without losing operational confidence</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  The detail page should feel curated and local while still guiding the guest into the same reliable payment, agreement, and pickup flow used elsewhere in Ride Fleet.
                </p>
              </div>
              <div className={styles.reassurancePanel}>
                <div className="label">What happens after reserve</div>
                <div className={styles.reassuranceChecklist}>
                  {nextSteps.map((step) => (
                    <div key={step} className={styles.reassuranceItem}>
                      <span className={styles.reassuranceDot} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className={`glass card ${styles.asidePanel}`}>
          <div className={styles.detailAsideHero}>
            <span className="label">Marketplace trip summary</span>
            <strong>Editorial listing feel, host-style warmth, and the same trusted Ride Fleet booking backbone.</strong>
          </div>
          <span className="eyebrow">Next Step</span>
          <div className="surface-note">
            <strong>Marketplace handoff</strong>
            <div className="ui-muted">After guests review the listing, they move into the same trusted reservation flow used by rentals.</div>
          </div>
          <div className="surface-note">
            <strong>Website goal</strong>
            <div className="ui-muted">This becomes the premium listing detail screen that makes car sharing feel distinct from fleet rentals without creating a second ops backend.</div>
          </div>
          <div className={styles.detailCtaStack}>
            <Link href={`${withSiteBase(basePath, '/checkout')}?${checkoutQuery}`} className="ios-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Reserve this listing
            </Link>
            <Link href={`${withSiteBase(basePath, '/checkout')}?${checkoutQuery}`} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Open reservation flow
            </Link>
            <Link href={`${withSiteBase(basePath, '/car-sharing')}?${backQuery}`} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to car sharing results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CarSharingDetailPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading listing detail...</div>}>
      <CarSharingDetailPreviewContent />
    </Suspense>
  );
}
