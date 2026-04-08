'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../lib/client';
import styles from '../sitePreviewPremium.module.css';
import {
  addDays,
  backendLocationIdsForPublicOption,
  buildPublicLocationOptions,
  buildUnifiedCheckoutQuery,
  fetchBookingBootstrap,
  fmtMoney,
  listingVehicleLabel,
  normalizeImageList,
  normalizePublicLocationSelectionId,
  publicCarSharingTenantSlug,
  publicLocationLabel,
  resolveSiteBasePath,
  searchParamsToString,
  toLocalInputValue,
  withSiteBase
} from '../sitePreviewShared';

const FILTERS = [
  { id: 'all', label: 'All Cars' },
  { id: 'instantBook', label: 'Instant Book' },
  { id: 'delivery', label: 'Delivery Available' }
];

function StarRating({ count }) {
  if (!count) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#6b7a9a'
      }}>
        <span style={{ color: '#94a3b8' }}>★★★★★</span> New
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: '0.82rem',
      fontWeight: 700,
      color: '#26314d'
    }}>
      <span style={{ color: '#f59e0b' }}>★★★★★</span> {count}
    </span>
  );
}

function InstantBookBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 11px',
      borderRadius: 999,
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: '#fff',
      fontSize: '0.76rem',
      fontWeight: 800,
      letterSpacing: '0.04em',
      boxShadow: '0 4px 14px rgba(22,163,74,0.28)',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '0.7rem' }}>⚡</span> Instant Book
    </span>
  );
}

function ProtectedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      borderRadius: 999,
      border: '1px solid rgba(110,73,255,0.14)',
      background: 'rgba(110,73,255,0.06)',
      color: '#4a38be',
      fontSize: '0.74rem',
      fontWeight: 700
    }}>
      <span>🛡</span> Protected by Ride Fleet
    </span>
  );
}

function applyFilter(listings, filter) {
  if (filter === 'instantBook') return listings.filter((l) => l?.instantBook);
  if (filter === 'delivery') return listings.filter((l) => l?.deliveryAvailable || l?.allowDelivery);
  return listings;
}

function CarSharingPreviewPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const carSharingTenantSlug = publicCarSharingTenantSlug();
  const [bootstrap, setBootstrap] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [form, setForm] = useState({
    locationId: String(searchParams.get('locationId') || ''),
    pickupAt: String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1))),
    returnAt: String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 2)))
  });

  useEffect(() => {
    (async () => {
      try {
        const payload = await fetchBookingBootstrap({ tenantSlug: carSharingTenantSlug });
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || 'Unable to load car sharing search'));
      }
    })();
  }, [carSharingTenantSlug]);

  const publicLocationOptions = useMemo(
    () => buildPublicLocationOptions(bootstrap?.locations || []),
    [bootstrap]
  );

  useEffect(() => {
    const firstLocationId = publicLocationOptions[0]?.id || '';
    if (!firstLocationId) return;
    setForm((current) => ({
      ...current,
      locationId: normalizePublicLocationSelectionId(publicLocationOptions, current.locationId) || firstLocationId
    }));
  }, [publicLocationOptions]);

  const runSearch = async () => {
    try {
      setSearching(true);
      setError('');
      const locationIds = backendLocationIdsForPublicOption(publicLocationOptions, form.locationId);
      if (!locationIds.length) {
        throw new Error('Pickup location not found');
      }
      const payload = await api('/api/public/booking/car-sharing-search', {
        method: 'POST',
        body: JSON.stringify({
          tenantSlug: bootstrap?.selectedTenant?.slug || carSharingTenantSlug || '',
          locationId: locationIds[0],
          locationIds,
          pickupAt: form.pickupAt,
          returnAt: form.returnAt
        })
      });
      setResults(payload);
    } catch (err) {
      setResults(null);
      setError(String(err?.message || 'Unable to search car sharing listings'));
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!bootstrap || !form.locationId) return;
    if (!searchParams.toString()) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrap]);

  const featuredListings = useMemo(
    () => Array.isArray(bootstrap?.featuredCarSharingListings) ? bootstrap.featuredCarSharingListings : [],
    [bootstrap]
  );

  const rawListings = Array.isArray(results?.results) && results.results.length ? results.results : featuredListings;
  const visibleListings = applyFilter(rawListings, activeFilter);

  return (
    <div className="stack" style={{ gap: 0 }}>

      {/* ── Hero search bar ── */}
      <section style={{
        background: 'linear-gradient(145deg, rgba(24,19,60,0.98), rgba(48,36,128,0.96) 48%, rgba(14,90,150,0.94))',
        padding: '40px 32px 36px',
        borderRadius: 28,
        marginBottom: 20,
        boxShadow: '0 28px 56px rgba(31,39,97,0.22)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 80% 0%, rgba(15,176,216,0.18) 0%, transparent 40%), radial-gradient(circle at 10% 80%, rgba(255,194,88,0.12) 0%, transparent 36%)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 28 }}>
          <p className={styles.heroNarrativeLabel} style={{ color: 'rgba(200,210,255,0.8)', marginBottom: 8 }}>Car Sharing</p>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.6vw,2.9rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f7fbff', lineHeight: 1.1 }}>
            Drive something local. Book it today.
          </h1>
          <p style={{ margin: '10px 0 0', color: 'rgba(220,226,255,0.84)', fontSize: '1rem', maxWidth: 560, lineHeight: 1.72 }}>
            Peer-to-peer vehicles with real pickup context, instant book options, and trip protection baked in.
          </p>
        </div>

        {/* Search bar card */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: 12,
          alignItems: 'end',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 22,
          padding: '18px 20px',
          boxShadow: '0 24px 48px rgba(14,20,60,0.28)',
          flexWrap: 'wrap'
        }}>
          <div className="stack" style={{ gap: 5 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a' }}>
              Pickup Location
            </label>
            <select
              value={form.locationId}
              onChange={(e) => setForm((c) => ({ ...c, locationId: e.target.value }))}
              style={{ height: 44, borderRadius: 12, border: '1.5px solid rgba(110,73,255,0.18)', background: '#fff', color: '#26314d', fontWeight: 700, paddingLeft: 12, fontSize: '0.95rem' }}
            >
              <option value="">Select location</option>
              {publicLocationOptions.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.label}</option>
              ))}
            </select>
          </div>

          <div className="stack" style={{ gap: 5 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a' }}>
              Pickup Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.pickupAt}
              onChange={(e) => setForm((c) => ({ ...c, pickupAt: e.target.value }))}
              style={{ height: 44, borderRadius: 12, border: '1.5px solid rgba(110,73,255,0.18)', background: '#fff', color: '#26314d', fontWeight: 700, paddingLeft: 12, fontSize: '0.95rem' }}
            />
          </div>

          <div className="stack" style={{ gap: 5 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a' }}>
              Return Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.returnAt}
              onChange={(e) => setForm((c) => ({ ...c, returnAt: e.target.value }))}
              style={{ height: 44, borderRadius: 12, border: '1.5px solid rgba(110,73,255,0.18)', background: '#fff', color: '#26314d', fontWeight: 700, paddingLeft: 12, fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="button"
            onClick={runSearch}
            disabled={searching}
            style={{
              height: 52,
              paddingLeft: 28,
              paddingRight: 28,
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6e49ff 55%, #0fb0d8)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: searching ? 'wait' : 'pointer',
              boxShadow: '0 12px 28px rgba(110,73,255,0.34)',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s ease'
            }}
          >
            {searching ? 'Searching…' : 'Search Cars'}
          </button>
        </div>

        {error ? (
          <div style={{ position: 'relative', zIndex: 1, marginTop: 12, color: '#fca5a5', fontWeight: 700, fontSize: '0.9rem' }}>{error}</div>
        ) : null}
      </section>

      {/* ── Filter pill bar ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 40,
              padding: '0 18px',
              borderRadius: 999,
              border: activeFilter === f.id ? '1.5px solid #6e49ff' : '1.5px solid rgba(110,73,255,0.16)',
              background: activeFilter === f.id
                ? 'linear-gradient(135deg, #6e49ff, #7c3aed)'
                : 'rgba(255,255,255,0.96)',
              color: activeFilter === f.id ? '#fff' : '#3b4770',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeFilter === f.id ? '0 8px 20px rgba(110,73,255,0.22)' : '0 2px 8px rgba(47,58,114,0.06)',
              transition: 'all 0.18s ease'
            }}
          >
            {f.id === 'instantBook' && <span style={{ marginRight: 6, fontSize: '0.78rem' }}>⚡</span>}
            {f.id === 'delivery' && <span style={{ marginRight: 6, fontSize: '0.78rem' }}>🚗</span>}
            {f.label}
          </button>
        ))}
        {rawListings.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '0.88rem', color: '#6b7a9a', fontWeight: 700, lineHeight: '40px' }}>
            {visibleListings.length} {visibleListings.length === 1 ? 'car' : 'cars'} available
          </span>
        )}
      </div>

      {/* ── Result cards ── */}
      <section className="stack" style={{ gap: 18 }}>
        {visibleListings.length ? (
          visibleListings.map((listing, index) => {
            const gallery = normalizeImageList(
              listing?.imageUrls?.length ? listing.imageUrls
              : listing?.primaryImageUrl ? [listing.primaryImageUrl]
              : []
            );
            const locationLabel = publicLocationLabel(
              listing?.location || bootstrap?.locations?.find((row) => String(row.id) === String(form.locationId))
            );
            const vehicleLabel = listing?.title || listingVehicleLabel(listing);
            const hostName = listing?.host?.displayName || listing?.hostDisplayName || null;
            const dailyRate = listing?.quote?.baseRate || listing?.baseDailyRate;
            const tripTotal = listing?.quote?.total || listing?.quote?.pickupTotal || listing?.quote?.deliveryTotal || listing?.baseDailyRate;

            return (
              <article
                key={`${listing?.id || index}`}
                className={`glass card ${styles.searchResultCard} ${styles.sharingResultCard}`}
                style={{ padding: 0, overflow: 'hidden', borderRadius: 22 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: gallery[0] ? '280px 1fr' : '1fr', gap: 0, alignItems: 'stretch' }}>

                  {/* Vehicle image */}
                  {gallery[0] ? (
                    <div style={{ position: 'relative', minHeight: 220, background: 'linear-gradient(180deg,#f0f2fc,#e8ecfa)' }}>
                      <Image
                        src={gallery[0]}
                        alt={vehicleLabel}
                        fill
                        sizes="(max-width: 960px) 100vw, 280px"
                        className={styles.galleryImage}
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        unoptimized
                      />
                      {listing?.instantBook ? (
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                          <InstantBookBadge />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Card body */}
                  <div className="stack" style={{ gap: 14, padding: '22px 24px' }}>

                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div className="stack" style={{ gap: 4 }}>
                        <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#1e2847', lineHeight: 1.2 }}>
                          {vehicleLabel}
                        </h3>
                        {hostName ? (
                          <span style={{ fontSize: '0.84rem', color: '#6b7a9a', fontWeight: 600 }}>
                            Hosted by {hostName}
                          </span>
                        ) : null}
                        <div style={{ marginTop: 4 }}>
                          <StarRating count={listing?.reviewCount || listing?.ratingCount || null} />
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.52rem', fontWeight: 900, color: '#1e2847', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          {fmtMoney(dailyRate)}
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7a9a' }}> /day</span>
                        </div>
                        {tripTotal && tripTotal !== dailyRate ? (
                          <div style={{ marginTop: 4, fontSize: '0.82rem', color: '#6b7a9a', fontWeight: 600 }}>
                            Est. {fmtMoney(tripTotal)} total
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Location + badges row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.84rem', color: '#53607b', fontWeight: 600 }}>
                        <span style={{ fontSize: '0.9rem' }}>📍</span> {locationLabel}
                      </span>
                      {!listing?.instantBook ? null : (
                        <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>·</span>
                      )}
                      <ProtectedBadge />
                    </div>

                    {/* Short description if available */}
                    {listing?.shortDescription ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#53607b', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {listing.shortDescription}
                      </p>
                    ) : null}

                    {/* CTA row */}
                    <div className={styles.resultActionRow} style={{ marginTop: 'auto', paddingTop: 6 }}>
                      <Link
                        href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
                          searchMode: 'CAR_SHARING',
                          tenantSlug: bootstrap?.selectedTenant?.slug || carSharingTenantSlug || '',
                          locationId: form.locationId,
                          pickupAt: form.pickupAt,
                          returnAt: form.returnAt,
                          listingId: listing?.id || ''
                        })}`}
                        className={styles.resultPrimaryAction}
                        style={{ textDecoration: 'none', flex: '0 0 auto' }}
                      >
                        Book Now
                      </Link>
                      <Link
                        href={`${withSiteBase(basePath, `/car-sharing/${listing?.id || ''}`)}?${searchParamsToString({ pickupAt: form.pickupAt, returnAt: form.returnAt, locationId: form.locationId, listingId: listing?.id || '' })}`}
                        className={styles.resultSecondaryAction}
                        style={{ textDecoration: 'none', flex: '0 0 auto' }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          /* Empty state */
          <section className="glass card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>🚗</div>
            <h3 style={{ margin: '0 0 10px', color: '#26314d', fontSize: '1.2rem' }}>No cars found for these dates</h3>
            <p className="ui-muted" style={{ margin: '0 0 22px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              No listings found for these dates. Try adjusting your dates or browse all available cars.
            </p>
            <button
              type="button"
              onClick={() => { setResults(null); setActiveFilter('all'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 46,
                padding: '0 24px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #6e49ff, #0fb0d8)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(110,73,255,0.26)'
              }}
            >
              Browse All Cars
            </button>
          </section>
        )}
      </section>

      {/* ── Why Ride Car Sharing trust section ── */}
      <section className={`glass card ${styles.prestigeBand}`} style={{ marginTop: 32 }}>
        <div className={styles.editorialHeader}>
          <span className="eyebrow">Why Ride Car Sharing</span>
          <h2 style={{ margin: 0 }}>The smarter way to share the road</h2>
        </div>
        <div className={styles.prestigeGrid}>
          {[
            {
              icon: '✅',
              title: 'Verified Hosts',
              body: 'Every host is reviewed before listing. You get real vehicles from real people, with identity and insurance checks built in.'
            },
            {
              icon: '🛡',
              title: 'Protected Trips',
              body: 'Trip protection is included on every booking. Your reservation is backed by Ride Fleet coverage from pickup to return.'
            },
            {
              icon: '✈️',
              title: 'Airport-Ready Pickups',
              body: 'Many listings offer airport-area pickup. Get detailed location instructions before you arrive so there are no surprises.'
            }
          ].map((card) => (
            <div key={card.title} className={styles.prestigeCard}>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ margin: '0 0 8px', color: '#1e2847', fontSize: '1.05rem', fontWeight: 800 }}>{card.title}</h3>
              <p className="ui-muted" style={{ margin: 0, lineHeight: 1.7, fontSize: '0.9rem' }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default function CarSharingPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 32 }}>Loading car sharing…</div>}>
      <CarSharingPreviewPageContent />
    </Suspense>
  );
}
