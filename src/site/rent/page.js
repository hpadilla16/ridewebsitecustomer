'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../lib/client';
import styles from '../sitePreviewPremium.module.css';
import { addDays, buildUnifiedCheckoutQuery, fetchBookingBootstrap, fmtMoney, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from '../sitePreviewShared';

function RentPreviewPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [bootstrap, setBootstrap] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    pickupLocationId: String(searchParams.get('pickupLocationId') || ''),
    returnLocationId: String(searchParams.get('returnLocationId') || ''),
    pickupAt: String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1))),
    returnAt: String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 4)))
  });

  useEffect(() => {
    (async () => {
      try {
        const payload = await fetchBookingBootstrap();
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || 'Unable to load rental search'));
      }
    })();
  }, []);

  useEffect(() => {
    const firstLocationId = bootstrap?.locations?.[0]?.id || '';
    if (!firstLocationId) return;
    setForm((current) => ({
      ...current,
      pickupLocationId: current.pickupLocationId || firstLocationId,
      returnLocationId: current.returnLocationId || firstLocationId
    }));
  }, [bootstrap]);

  const runSearch = async () => {
    try {
      setSearching(true);
      setError('');
      const payload = await api('/api/public/booking/rental-search', {
        method: 'POST',
        body: JSON.stringify({
          pickupLocationId: form.pickupLocationId,
          returnLocationId: form.returnLocationId,
          pickupAt: form.pickupAt,
          returnAt: form.returnAt
        })
      });
      setResults(payload);
    } catch (err) {
      setResults(null);
      setError(String(err?.message || 'Unable to search rentals'));
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!bootstrap || !form.pickupLocationId || !form.returnLocationId) return;
    if (!searchParams.toString()) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrap]);

  const locationLookup = useMemo(() => {
    const map = new Map();
    (bootstrap?.locations || []).forEach((location) => {
      map.set(String(location.id), publicLocationLabel(location));
    });
    return map;
  }, [bootstrap]);

  const queryString = searchParamsToString({
    pickupLocationId: form.pickupLocationId,
    returnLocationId: form.returnLocationId,
    pickupAt: form.pickupAt,
    returnAt: form.returnAt
  });

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Rental Search</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>Traditional rental booking lane</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          Search real Ride Fleet rental availability with a cleaner public booking experience built for airport-ready trips.
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: 24 }}>
        <div className="grid2">
          <div className="stack">
            <label className="label">Pickup location</label>
            <select value={form.pickupLocationId} onChange={(e) => setForm((current) => ({ ...current, pickupLocationId: e.target.value }))}>
              <option value="">Select location</option>
              {(bootstrap?.locations || []).map((location) => (
                <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>
              ))}
            </select>
          </div>
          <div className="stack">
            <label className="label">Return location</label>
            <select value={form.returnLocationId} onChange={(e) => setForm((current) => ({ ...current, returnLocationId: e.target.value }))}>
              <option value="">Select location</option>
              {(bootstrap?.locations || []).map((location) => (
                <option key={location.id} value={location.id}>{publicLocationLabel(location)}</option>
              ))}
            </select>
          </div>
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
            {searching ? 'Searching...' : 'Load real rental availability'}
          </button>
          <Link href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
            pickupLocationId: form.pickupLocationId,
            returnLocationId: form.returnLocationId,
            pickupAt: form.pickupAt,
            returnAt: form.returnAt
          })}`} className="ios-btn secondary" style={{ textDecoration: 'none' }}>
            Open checkout
          </Link>
        </div>
        {error ? <div className="label" style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
        <div className={styles.reassuranceBand} style={{ marginTop: 18 }}>
          <span className={styles.reassurancePill}>Live availability from Ride Fleet</span>
          <span className={styles.reassurancePill}>Hosted payment handoff at checkout</span>
          <span className={styles.reassurancePill}>Airport pickup expectations surfaced earlier</span>
        </div>
      </section>

      <section className="stack" style={{ gap: 16 }}>
        {(results?.results || []).length ? (
          (results.results || []).map((result, index) => (
            <article key={`${result?.vehicleType?.id || index}`} className={`glass card ${styles.searchResultCard}`} style={{ padding: 24 }}>
              <div className="row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                <div className="stack" style={{ gap: 6 }}>
                  <span className="eyebrow">Available rental option</span>
                  <h3 style={{ margin: 0 }}>{vehicleTypeLabel(result.vehicleType)}</h3>
                  <p className="ui-muted" style={{ margin: 0 }}>
                    {locationLookup.get(String(result?.location?.id || form.pickupLocationId)) || publicLocationLabel(result?.location)}
                  </p>
                </div>
                <span className={`status-chip ${result?.soldOut ? 'warn' : 'good'}`}>
                  {Number(result?.availabilityCount || 0)} available
                </span>
              </div>
              <div className="metric-grid" style={{ marginTop: 16 }}>
                <div className="metric-card">
                  <span className="label">Daily rate</span>
                  <strong>{fmtMoney(result?.quote?.dailyRate)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Estimated total</span>
                  <strong>{fmtMoney(result?.quote?.estimatedTripTotal)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Due now</span>
                  <strong>{fmtMoney(result?.quote?.depositAmountDue)}</strong>
                </div>
              </div>
              <div className={styles.trustCueRow}>
                <span className={styles.trustCue}>Due now shown before checkout</span>
                <span className={styles.trustCue}>Hosted payment experience</span>
                <span className={styles.trustCue}>Pickup context included</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                <Link
                  href={`${withSiteBase(basePath, `/rent/${result?.vehicleType?.id || ''}`)}?${searchParamsToString({
                    pickupLocationId: result?.location?.id || form.pickupLocationId,
                    returnLocationId: form.returnLocationId,
                    pickupAt: form.pickupAt,
                    returnAt: form.returnAt,
                    vehicleTypeId: result?.vehicleType?.id || ''
                  })}`}
                  className="ios-action-btn"
                  style={{ textDecoration: 'none' }}
                >
                  View details
                </Link>
                <Link
                  href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
                    pickupLocationId: result?.location?.id || form.pickupLocationId,
                    returnLocationId: form.returnLocationId,
                    pickupAt: form.pickupAt,
                    returnAt: form.returnAt,
                    vehicleTypeId: result?.vehicleType?.id || ''
                  })}`}
                  className="button-subtle"
                  style={{ textDecoration: 'none' }}
                >
                  Unified checkout
                </Link>
              </div>
            </article>
          ))
        ) : (
          <section className="glass card" style={{ padding: 24 }}>
            <div className="label">Results</div>
            <p className="ui-muted" style={{ marginBottom: 0 }}>
              Run a rental search to see real availability and pricing from the public booking API.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

export default function RentPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading rentals...</div>}>
      <RentPreviewPageContent />
    </Suspense>
  );
}
