'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../lib/client';
import { addDays, buildUnifiedCheckoutQuery, fmtMoney, listingVehicleLabel, normalizeImageList, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, withSiteBase } from '../sitePreviewShared';

function CarSharingPreviewPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [bootstrap, setBootstrap] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    locationId: String(searchParams.get('locationId') || ''),
    pickupAt: String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1))),
    returnAt: String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 2)))
  });

  useEffect(() => {
    (async () => {
      try {
        const payload = await api('/api/public/booking/bootstrap');
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || 'Unable to load car sharing search'));
      }
    })();
  }, []);

  useEffect(() => {
    const firstLocationId = bootstrap?.locations?.[0]?.id || '';
    if (!firstLocationId) return;
    setForm((current) => ({
      ...current,
      locationId: current.locationId || firstLocationId
    }));
  }, [bootstrap]);

  const runSearch = async () => {
    try {
      setSearching(true);
      setError('');
      const payload = await api('/api/public/booking/car-sharing-search', {
        method: 'POST',
        body: JSON.stringify({
          locationId: form.locationId,
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

  const visibleListings = Array.isArray(results?.results) && results.results.length ? results.results : featuredListings;
  const queryString = searchParamsToString(form);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Car Sharing Search</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>Dedicated entry point for car sharing guests</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          Browse featured marketplace-style listings and run real car sharing searches by date and location.
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: 24 }}>
        <div className="grid2">
          <div className="stack">
            <label className="label">Location</label>
            <select value={form.locationId} onChange={(e) => setForm((current) => ({ ...current, locationId: e.target.value }))}>
              <option value="">Select location</option>
              {(bootstrap?.locations || []).map((location) => (
                <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>
              ))}
            </select>
          </div>
          <div />
          <div className="stack">
            <label className="label">Pickup</label>
            <input type="datetime-local" value={form.pickupAt} onChange={(e) => setForm((current) => ({ ...current, pickupAt: e.target.value }))} />
          </div>
          <div className="stack">
            <label className="label">Return</label>
            <input type="datetime-local" value={form.returnAt} onChange={(e) => setForm((current) => ({ ...current, returnAt: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          <button type="button" className="ios-action-btn" onClick={runSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search car sharing inventory'}
          </button>
          <Link href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
            searchMode: 'CAR_SHARING',
            locationId: form.locationId,
            pickupAt: form.pickupAt,
            returnAt: form.returnAt
          })}`} className="ios-btn secondary" style={{ textDecoration: 'none' }}>
            Open checkout
          </Link>
        </div>
        {error ? <div className="label" style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
      </section>

      <section className="stack" style={{ gap: 16 }}>
        {visibleListings.length ? (
          visibleListings.map((listing, index) => {
            const gallery = normalizeImageList(listing?.imageUrls?.length ? listing.imageUrls : listing?.primaryImageUrl ? [listing.primaryImageUrl] : []);
            const locationLabel = publicLocationLabel(listing?.location || bootstrap?.locations?.find((row) => String(row.id) === String(form.locationId)));
            return (
              <article key={`${listing?.id || index}`} className="glass card" style={{ padding: 24 }}>
                <div style={{ display: 'grid', gap: 18, gridTemplateColumns: gallery[0] ? '220px 1fr' : '1fr' }}>
                  {gallery[0] ? (
                    <img
                      src={gallery[0]}
                      alt={listingVehicleLabel(listing)}
                      style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 20, border: '1px solid rgba(110,73,255,.16)' }}
                    />
                  ) : null}
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                      <div className="stack" style={{ gap: 6 }}>
                        <span className="eyebrow">Car sharing listing</span>
                        <h3 style={{ margin: 0 }}>{listing?.title || listingVehicleLabel(listing)}</h3>
                        <p className="ui-muted" style={{ margin: 0 }}>{listing?.shortDescription || locationLabel}</p>
                      </div>
                      {listing?.instantBook ? <span className="status-chip good">Instant book</span> : null}
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
                        <span className="label">Location</span>
                        <strong>{locationLabel}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <Link href={`${withSiteBase(basePath, `/car-sharing/${listing?.id || ''}`)}?${searchParamsToString({ pickupAt: form.pickupAt, returnAt: form.returnAt, locationId: form.locationId, listingId: listing?.id || '' })}`} className="ios-action-btn" style={{ textDecoration: 'none' }}>
                        View listing
                      </Link>
                      <Link
                        href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
                          searchMode: 'CAR_SHARING',
                          locationId: form.locationId,
                          pickupAt: form.pickupAt,
                          returnAt: form.returnAt,
                          listingId: listing?.id || ''
                        })}`}
                        className="button-subtle"
                        style={{ textDecoration: 'none' }}
                      >
                        Unified checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <section className="glass card" style={{ padding: 24 }}>
            <div className="label">Catalog</div>
            <p className="ui-muted" style={{ marginBottom: 0 }}>
              When featured listings are available for this tenant, they will show here even before a date search runs.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

export default function CarSharingPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading car sharing...</div>}>
      <CarSharingPreviewPageContent />
    </Suspense>
  );
}
