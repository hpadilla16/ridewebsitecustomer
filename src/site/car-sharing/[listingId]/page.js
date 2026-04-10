'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/client';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import {
  addDays,
  backendLocationIdsForPublicOption,
  buildPublicLocationOptions,
  buildUnifiedCheckoutQuery,
  fetchBookingBootstrap,
  fmtMoney,
  formatPublicDateTime,
  listingVehicleLabel,
  normalizeImageList,
  publicCarSharingTenantSlug,
  publicLocationLabel,
  resolveSiteBasePath,
  searchParamsToString,
  toLocalInputValue,
  withSiteBase
} from '../../sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

function InstantBookBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 14px',
      borderRadius: 999,
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: '#fff',
      fontSize: '0.82rem',
      fontWeight: 800,
      letterSpacing: '0.04em',
      boxShadow: '0 6px 16px rgba(22,163,74,0.26)'
    }}>
      <span style={{ fontSize: '0.78rem' }}>⚡</span> Instant Book
    </span>
  );
}

function ProtectedBadge() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 16px',
      borderRadius: 14,
      border: '1px solid rgba(110,73,255,0.14)',
      background: 'rgba(110,73,255,0.05)',
      color: '#4a38be',
      fontSize: '0.88rem',
      fontWeight: 700
    }}>
      <span style={{ fontSize: '1.1rem' }}>🛡</span>
      <span>Trip protection included on every booking</span>
    </div>
  );
}

function StarRating({ count }) {
  if (!count) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.88rem', fontWeight: 700, color: '#6b7a9a' }}>
        <span style={{ color: '#94a3b8' }}>★★★★★</span> New listing
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.88rem', fontWeight: 700, color: '#26314d' }}>
      <span style={{ color: '#f59e0b' }}>★★★★★</span> {count} reviews
    </span>
  );
}

function CarSharingDetailPreviewContent() {
  const params = useParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const searchParams = useSearchParams();
  const listingId = String(params?.listingId || '');
  const carSharingTenantSlug = publicCarSharingTenantSlug();
  const [bootstrap, setBootstrap] = useState(null);
  const [listing, setListing] = useState(null);
  const [hostProfile, setHostProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);

  const locationId = String(searchParams.get('locationId') || '');
  const pickupAt = String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1)));
  const returnAt = String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 2)));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const boot = await fetchBookingBootstrap({ tenantSlug: carSharingTenantSlug });
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
            tenantSlug: boot?.selectedTenant?.slug || carSharingTenantSlug || '',
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
          // Fetch host profile with reviews in background
          const hostId = match?.host?.id || match?.hostProfileId;
          if (hostId) {
            api(`/api/public/booking/hosts/${hostId}`).then((hp) => {
              if (!ignore) setHostProfile(hp || null);
            }).catch(() => {});
          }
        }
      } catch (err) {
        setListing(null);
        setError(String(err?.message || 'Unable to load car sharing listing.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [carSharingTenantSlug, listingId, locationId, pickupAt, returnAt]);

  const gallery = normalizeImageList(listing?.imageUrls?.length ? listing.imageUrls : listing?.primaryImageUrl ? [listing.primaryImageUrl] : []);
  const location = listing?.location || bootstrap?.locations?.find((entry) => String(entry.id) === String(locationId)) || null;
  const checkoutQuery = buildUnifiedCheckoutQuery({
    searchMode: 'CAR_SHARING',
    tenantSlug: bootstrap?.selectedTenant?.slug || carSharingTenantSlug || '',
    locationId: listing?.location?.id || locationId,
    pickupAt,
    returnAt,
    listingId
  });
  const backQuery = searchParamsToString({ locationId, pickupAt, returnAt });

  const vehicleLabel = listing?.title || listingVehicleLabel(listing);
  const hostName = listing?.host?.displayName || listing?.hostDisplayName || null;
  const dailyRate = listing?.quote?.baseRate || listing?.baseDailyRate;
  const tripTotal = listing?.quote?.total || listing?.quote?.pickupTotal || listing?.quote?.deliveryTotal || listing?.baseDailyRate;
  const locationStr = publicLocationLabel(location);

  const howItWorks = [
    {
      step: '1',
      title: 'Search & Book',
      body: 'Browse verified local vehicles by date and location. Instant Book or request to reserve — your choice.'
    },
    {
      step: '2',
      title: 'Meet Your Host',
      body: 'Get clear pickup instructions before your trip. Your host will have everything ready at the agreed time and place.'
    },
    {
      step: '3',
      title: 'Drive & Return',
      body: 'Hit the road with trip protection included. Return on time and complete the trip through your confirmation link.'
    }
  ];

  return (
    <div className="stack" style={{ gap: 20 }}>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Car Sharing', href: '/car-sharing' },
        { label: vehicleLabel || 'Listing' }
      ]} />

      {/* ── Back link ── */}
      <div>
        <Link
          href={`${withSiteBase(basePath, '/car-sharing')}?${backQuery}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#4a38be',
            textDecoration: 'none',
            padding: '8px 0'
          }}
        >
          <span style={{ fontSize: '1rem' }}>←</span> Back to search results
        </Link>
      </div>

      {/* ── Full-width hero image ── */}
      {loading ? null : gallery[0] ? (
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 7',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 28px 56px rgba(31,39,97,0.18)',
          background: 'linear-gradient(180deg,#e8ecfb,#d6dcf5)',
          border: '1px solid rgba(110,73,255,0.1)'
        }}>
          <Image
            src={gallery[activeThumb] || gallery[0]}
            alt={vehicleLabel}
            fill
            sizes="(max-width: 960px) 100vw, 1200px"
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
          {/* Gradient overlay with title */}
          <div style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            padding: '56px 32px 28px',
            background: 'linear-gradient(0deg, rgba(14,18,52,0.82) 0%, transparent 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.6rem,3.2vw,2.6rem)', fontWeight: 900, color: '#f7fbff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {vehicleLabel}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {listing?.instantBook ? <InstantBookBadge /> : null}
                  <StarRating count={listing?.reviewCount || listing?.ratingCount || null} />
                  {hostName ? (
                    <span style={{ fontSize: '0.88rem', color: 'rgba(220,228,255,0.9)', fontWeight: 600 }}>
                      Hosted by {hostName}
                    </span>
                  ) : null}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f7fbff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {fmtMoney(dailyRate)}
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(220,228,255,0.8)' }}> /day</span>
                </div>
                {tripTotal && tripTotal !== dailyRate ? (
                  <div style={{ marginTop: 4, fontSize: '0.88rem', color: 'rgba(200,210,255,0.82)', fontWeight: 600 }}>
                    Est. {fmtMoney(tripTotal)} total
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Thumbnail strip */}
      {!loading && gallery.length > 1 ? (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveThumb(i)}
              style={{
                flex: '0 0 96px',
                height: 68,
                borderRadius: 12,
                overflow: 'hidden',
                border: activeThumb === i ? '2.5px solid #6e49ff' : '2px solid rgba(110,73,255,0.14)',
                cursor: 'pointer',
                padding: 0,
                background: '#e8ecfa',
                boxShadow: activeThumb === i ? '0 6px 16px rgba(110,73,255,0.22)' : 'none',
                transition: 'border-color 0.16s ease, box-shadow 0.16s ease'
              }}
            >
              <Image src={src} alt={`View ${i + 1}`} width={96} height={68} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} unoptimized />
            </button>
          ))}
        </div>
      ) : null}

      {/* ── Two-column layout ── */}
      <div className={styles.detailGrid}>

        {/* LEFT column — content */}
        <div className="stack" style={{ gap: 18 }}>

          {loading ? (
            <div className={`glass card ${styles.contentPanel}`}>
              <div className="ui-muted">Loading listing…</div>
            </div>
          ) : error && !listing ? (
            <div className={`glass card ${styles.contentPanel}`}>
              <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div>
            </div>
          ) : listing ? (
            <>
              {/* About this car */}
              <div className={`glass card ${styles.contentPanel}`} style={{ gap: 14 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>About this car</h2>
                {listing.shortDescription || listing.description ? (
                  <p style={{ margin: 0, color: '#53607b', lineHeight: 1.78, fontSize: '0.97rem' }}>
                    {listing.description || listing.shortDescription}
                  </p>
                ) : (
                  <p style={{ margin: 0, color: '#53607b', lineHeight: 1.78, fontSize: '0.97rem' }}>
                    A locally hosted vehicle available for your trip dates. Contact the host for any specific questions before booking.
                  </p>
                )}

                {/* Vehicle meta chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {listing?.vehicle?.year ? (
                    <span className={styles.resultMetaChip}>{listing.vehicle.year}</span>
                  ) : null}
                  {listing?.vehicle?.make ? (
                    <span className={styles.resultMetaChip}>{listing.vehicle.make}</span>
                  ) : null}
                  {listing?.vehicle?.model ? (
                    <span className={styles.resultMetaChip}>{listing.vehicle.model}</span>
                  ) : null}
                  {listing?.instantBook ? (
                    <span className={styles.resultMetaChip} style={{ borderColor: 'rgba(22,163,74,0.2)', background: 'linear-gradient(180deg,rgba(240,253,244,0.98),rgba(220,252,231,0.94))' }}>
                      Instant Book Available
                    </span>
                  ) : null}
                </div>
                {(listing?.vehicle?.mileage || listing?.vehicle?.color || listing?.vehicle?.vin) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {listing?.vehicle?.mileage && <span className={styles.resultMetaChip}>{Number(listing.vehicle.mileage).toLocaleString()} mi</span>}
                    {listing?.vehicle?.color && <span className={styles.resultMetaChip}>{listing.vehicle.color}</span>}
                  </div>
                )}
              </div>

              {/* What's included */}
              <div className={`glass card ${styles.contentPanel}`} style={{ gap: 14 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>What's included</h2>
                <div className="stack" style={{ gap: 10 }}>
                  <ProtectedBadge />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                    borderRadius: 14, border: '1px solid rgba(110,73,255,0.12)',
                    background: 'rgba(246,244,255,0.7)', color: '#32405d', fontSize: '0.88rem', fontWeight: 700
                  }}>
                    <span style={{ fontSize: '1.05rem' }}>💳</span>
                    <span>Hosted payment — pay securely through our hosted checkout</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                    borderRadius: 14, border: '1px solid rgba(110,73,255,0.12)',
                    background: 'rgba(246,244,255,0.7)', color: '#32405d', fontSize: '0.88rem', fontWeight: 700
                  }}>
                    <span style={{ fontSize: '1.05rem' }}>📍</span>
                    <span>Pickup instructions shared before your trip — location, timing, and host contact</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                    borderRadius: 14, border: '1px solid rgba(110,73,255,0.12)',
                    background: 'rgba(246,244,255,0.7)', color: '#32405d', fontSize: '0.88rem', fontWeight: 700
                  }}>
                    <span style={{ fontSize: '1.05rem' }}>📄</span>
                    <span>Trip confirmation, documents, and post-booking follow-up in one place</span>
                  </div>
                </div>
              </div>

              {/* The Host */}
              <div className={`glass card ${styles.contentPanel}`} style={{ gap: 14 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>The Host</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6e49ff, #0fb0d8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', color: '#fff', flexShrink: 0,
                    boxShadow: '0 8px 20px rgba(110,73,255,0.24)'
                  }}>
                    {hostName ? hostName.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e2847', fontSize: '1rem' }}>
                      {(listing?.host?.id) ? (
                        <Link href={`/hosts/${listing.host.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{hostName || 'Verified Host'}</Link>
                      ) : (hostName || 'Verified Host')}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#6b7a9a', fontWeight: 600, marginTop: 2 }}>
                      Verified host
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <StarRating count={listing?.reviewCount || listing?.ratingCount || null} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip rules */}
              {listing?.tripRules ? (
                <div className={`glass card ${styles.contentPanel}`} style={{ gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>Trip rules</h2>
                  <p style={{ margin: 0, color: '#53607b', lineHeight: 1.75, fontSize: '0.94rem' }}>
                    {listing.tripRules}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {/* RIGHT column — sticky booking card */}
        <div>
          <div className={`glass card ${styles.asidePanel}`} style={{ gap: 18 }}>

            {/* Price header */}
            <div style={{
              padding: '18px 20px 20px',
              borderRadius: 18,
              background: 'linear-gradient(145deg, rgba(24,19,60,0.97), rgba(48,36,128,0.95) 52%, rgba(14,90,150,0.94))',
              color: '#f7fbff',
              boxShadow: '0 20px 40px rgba(31,39,97,0.22)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle at 80% 10%, rgba(15,176,216,0.18) 0%, transparent 48%)'
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(200,210,255,0.76)', marginBottom: 6 }}>
                  Trip Price
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {fmtMoney(dailyRate)}
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(220,228,255,0.8)' }}> /day</span>
                </div>
                {tripTotal && tripTotal !== dailyRate ? (
                  <div style={{ marginTop: 6, fontSize: '0.9rem', color: 'rgba(200,212,255,0.84)', fontWeight: 600 }}>
                    Est. {fmtMoney(tripTotal)} total for this trip
                  </div>
                ) : null}
                {listing?.instantBook ? (
                  <div style={{ marginTop: 12 }}>
                    <InstantBookBadge />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Dates summary */}
            <div style={{
              display: 'grid', gap: 10,
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(110,73,255,0.12)',
              background: 'rgba(246,244,255,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', fontWeight: 700, color: '#32405d' }}>
                <span style={{ color: '#6b7a9a', fontWeight: 600 }}>Pickup</span>
                <span>{formatPublicDateTime(pickupAt)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(110,73,255,0.1)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', fontWeight: 700, color: '#32405d' }}>
                <span style={{ color: '#6b7a9a', fontWeight: 600 }}>Return</span>
                <span>{formatPublicDateTime(returnAt)}</span>
              </div>
            </div>

            {/* Location */}
            {locationStr ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#53607b', fontWeight: 600 }}>
                <span style={{ fontSize: '1rem' }}>📍</span>
                <span>{locationStr}</span>
              </div>
            ) : null}

            {/* Security deposit */}
            {listing?.securityDeposit || listing?.depositAmount ? (
              <div style={{ fontSize: '0.84rem', color: '#6b7a9a', fontWeight: 600, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(110,73,255,0.1)', background: 'rgba(246,244,255,0.7)' }}>
                Security deposit: {fmtMoney(listing.securityDeposit || listing.depositAmount)} (refundable)
              </div>
            ) : null}

            {/* Book CTA */}
            <div className={styles.detailCtaStack}>
              <Link
                href={`${withSiteBase(basePath, '/checkout')}?${checkoutQuery}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 54, borderRadius: 16, border: 'none', textDecoration: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6e49ff 55%, #0fb0d8)',
                  color: '#fff', fontWeight: 900, fontSize: '1.05rem',
                  boxShadow: '0 14px 32px rgba(110,73,255,0.32)',
                  letterSpacing: '0.01em',
                }}
              >
                Book This Car
              </Link>
              {(listing?.deliveryAvailable || listing?.allowDelivery) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.05)', fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                  <span>🚗</span><span>Delivery available for this listing</span>
                </div>
              )}
            </div>

            {/* Trust line */}
            <ProtectedBadge />

            {/* Cancellation policy */}
            <div style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(110,73,255,.06)', background: 'rgba(110,73,255,.02)', fontSize: '0.82rem', color: '#53607b', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#1e2847', marginBottom: 4, fontSize: '0.84rem' }}>Cancellation Policy</div>
              <div>Free cancellation up to 24 hours before pickup. Late cancellations may incur a fee.</div>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center', lineHeight: 1.55 }}>
              You won't be charged until your reservation is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className={`glass card ${styles.journeyPanel}`} style={{ marginTop: 8 }}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">How it works</span>
          <h2 style={{ margin: 0 }}>Three steps to your perfect trip</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {howItWorks.map((item) => (
            <div key={item.step} className={styles.processCard}>
              <div className={styles.timelineMarker} style={{ width: 44, height: 44, marginBottom: 14 }}>
                {item.step}
              </div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: '#1e2847', fontSize: '1rem' }}>{item.title}</h3>
              <p className="ui-muted" style={{ margin: 0, lineHeight: 1.7, fontSize: '0.9rem' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Guest Reviews ── */}
      {hostProfile?.reviews?.length > 0 && (
        <section className={`glass card ${styles.journeyPanel}`} style={{ marginTop: 8 }}>
          <div className={styles.editorialHeader}>
            <span className="eyebrow">Guest Reviews</span>
            <h2 style={{ margin: 0 }}>
              {hostProfile.host?.averageRating ? `${Number(hostProfile.host.averageRating).toFixed(1)} ★` : ''} {hostProfile.host?.reviewCount || hostProfile.reviews.length} reviews
            </h2>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {hostProfile.reviews.map((review) => (
              <div key={review.id} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(Math.min(Math.round(Number(review.rating || 0)), 5))}{'☆'.repeat(Math.max(0, 5 - Math.round(Number(review.rating || 0))))}</span>
                    <span style={{ marginLeft: 8, fontWeight: 700, color: '#1e2847', fontSize: '0.9rem' }}>{review.reviewerName || 'Guest'}</span>
                  </div>
                  {review.submittedAt && <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{formatPublicDateTime(review.submittedAt)}</span>}
                </div>
                {review.comments && <p style={{ margin: 0, color: '#53607b', fontSize: '0.88rem', lineHeight: 1.6 }}>{review.comments}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default function CarSharingDetailPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 32 }}>Loading listing detail…</div>}>
      <CarSharingDetailPreviewContent />
    </Suspense>
  );
}
