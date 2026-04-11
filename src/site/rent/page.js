'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/client';
import styles from '../sitePreviewPremium.module.css';
import { addDays, backendLocationIdsForPublicOption, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fetchBookingBootstrap, fmtMoney, normalizePublicLocationSelectionId, publicLocationLabel, rentalResultImageList, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from '../sitePreviewShared';

function RentPreviewPageContent() {
  const { t } = useTranslation();
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
        setError(String(err?.message || t('rentPage.unableToLoadSearch')));
      }
    })();
  }, []);

  const publicLocationOptions = useMemo(
    () => buildPublicLocationOptions(bootstrap?.locations || []),
    [bootstrap]
  );

  useEffect(() => {
    const firstLocationId = publicLocationOptions[0]?.id || '';
    if (!firstLocationId) return;
    setForm((current) => ({
      ...current,
      pickupLocationId: normalizePublicLocationSelectionId(publicLocationOptions, current.pickupLocationId) || firstLocationId,
      returnLocationId: normalizePublicLocationSelectionId(publicLocationOptions, current.returnLocationId) || firstLocationId
    }));
  }, [publicLocationOptions]);

  const runSearch = async () => {
    try {
      setSearching(true);
      setError('');
      const pickupLocationIds = backendLocationIdsForPublicOption(publicLocationOptions, form.pickupLocationId);
      const returnLocationIds = backendLocationIdsForPublicOption(publicLocationOptions, form.returnLocationId);
      if (!pickupLocationIds.length) {
        throw new Error(t('rentPage.pickupLocationNotFound'));
      }
      const resolvedReturnLocationIds = returnLocationIds.length ? returnLocationIds : pickupLocationIds;
      const payload = await api('/api/public/booking/rental-search', {
        method: 'POST',
        body: JSON.stringify({
          pickupLocationId: pickupLocationIds[0],
          pickupLocationIds,
          returnLocationId: resolvedReturnLocationIds[0] || pickupLocationIds[0],
          returnLocationIds: resolvedReturnLocationIds,
          pickupAt: form.pickupAt,
          returnAt: form.returnAt
        })
      });
      setResults(payload);
    } catch (err) {
      setResults(null);
      setError(String(err?.message || t('rentPage.unableToSearchRentals')));
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
    publicLocationOptions.forEach((location) => {
      map.set(String(location.id), location.label);
      (location.locationIds || []).forEach((locationId) => {
        map.set(String(locationId), location.label);
      });
    });
    return map;
  }, [publicLocationOptions]);

  const queryString = searchParamsToString({
    pickupLocationId: form.pickupLocationId,
    returnLocationId: form.returnLocationId,
    pickupAt: form.pickupAt,
    returnAt: form.returnAt
  });

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">{t('rentPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>{t('rentPage.heading')}</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          {t('rentPage.description')}
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: 24 }}>
        <div className="grid2">
          <div className="stack">
            <label className="label">{t('rentPage.pickupLocation')}</label>
            <select value={form.pickupLocationId} onChange={(e) => setForm((current) => ({ ...current, pickupLocationId: e.target.value }))}>
              <option value="">{t('rentPage.selectLocation')}</option>
              {publicLocationOptions.map((location) => (
                <option key={location.id} value={location.id}>{location.label}</option>
              ))}
            </select>
          </div>
          <div className="stack">
            <label className="label">{t('rentPage.returnLocation')}</label>
            <select value={form.returnLocationId} onChange={(e) => setForm((current) => ({ ...current, returnLocationId: e.target.value }))}>
              <option value="">{t('rentPage.selectLocation')}</option>
              {publicLocationOptions.map((location) => (
                <option key={location.id} value={location.id}>{location.label}</option>
              ))}
            </select>
          </div>
          <div className="stack">
            <label className="label">{t('rentPage.pickup')}</label>
            <input type="datetime-local" value={form.pickupAt} onChange={(e) => setForm((current) => ({ ...current, pickupAt: e.target.value }))} />
          </div>
          <div className="stack">
            <label className="label">{t('rentPage.return')}</label>
            <input type="datetime-local" value={form.returnAt} onChange={(e) => setForm((current) => ({ ...current, returnAt: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          <button type="button" className="ios-action-btn" onClick={runSearch} disabled={searching}>
            {searching ? t('rentPage.searching') : t('rentPage.loadAvailability')}
          </button>
          <Link href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
            pickupLocationId: form.pickupLocationId,
            returnLocationId: form.returnLocationId,
            pickupAt: form.pickupAt,
            returnAt: form.returnAt
          })}`} className="ios-btn secondary" style={{ textDecoration: 'none' }}>
            {t('rentPage.openReservationFlow')}
          </Link>
        </div>
        {error ? <div className="label" style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
        <div className={styles.reassuranceBand} style={{ marginTop: 18 }}>
          <span className={styles.reassurancePill}>{t('rentPage.liveAvailability')}</span>
          <span className={styles.reassurancePill}>{t('rentPage.hostedPaymentHandoff')}</span>
          <span className={styles.reassurancePill}>{t('rentPage.airportPickupExpectations')}</span>
        </div>
      </section>

      <section className="stack" style={{ gap: 16 }}>
        {(results?.results || []).length ? (
          (results.results || []).map((result, index) => {
            const gallery = rentalResultImageList(result);
            return (
              <article key={`${result?.vehicleType?.id || index}`} className={`glass card ${styles.searchResultCard}`} style={{ padding: 24 }}>
                <div className={styles.searchResultGrid} style={{ gridTemplateColumns: gallery[0] ? '220px 1fr' : '1fr' }}>
                  {gallery[0] ? (
                    <Image
                      src={gallery[0]}
                      alt={vehicleTypeLabel(result.vehicleType)}
                      width={640}
                      height={480}
                      sizes="(max-width: 960px) 100vw, 220px"
                      className={styles.resultCardImage}
                      loading="lazy"
                      unoptimized
                    />
                  ) : null}
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
                      <div className="stack" style={{ gap: 6 }}>
                        <span className="eyebrow">{t('rentPage.availableRentalOption')}</span>
                        <h3 style={{ margin: 0 }}>{vehicleTypeLabel(result.vehicleType)}</h3>
                        <p className="ui-muted" style={{ margin: 0 }}>
                          {locationLookup.get(String(result?.location?.id || form.pickupLocationId)) || publicLocationLabel(result?.location)}
                        </p>
                      </div>
                      <span className={`status-chip ${result?.soldOut ? 'warn' : 'good'}`}>
                        {t('rentPage.availableCount', { count: Number(result?.availabilityCount || 0) })}
                      </span>
                    </div>
                    <div className={styles.resultMetaRow}>
                      <span className={styles.resultMetaChip}>{t('rentPage.airportReadyClass')}</span>
                      <span className={styles.resultMetaChip}>{t('rentPage.hostedPaymentHandoffShort')}</span>
                      <span className={styles.resultMetaChip}>{t('rentPage.pickupContextSurfacedEarly')}</span>
                    </div>
                    <div className="metric-grid" style={{ marginTop: 6 }}>
                      <div className="metric-card">
                        <span className="label">{t('rentPage.dailyRate')}</span>
                        <strong>{fmtMoney(result?.quote?.dailyRate)}</strong>
                      </div>
                      <div className="metric-card">
                        <span className="label">{t('rentPage.estimatedTotal')}</span>
                        <strong>{fmtMoney(result?.quote?.estimatedTripTotal)}</strong>
                      </div>
                      <div className="metric-card">
                        <span className="label">{t('rentPage.dueNow')}</span>
                        <strong>{fmtMoney(result?.quote?.depositAmountDue)}</strong>
                      </div>
                    </div>
                    <div className={styles.trustCueRow}>
                      <span className={styles.trustCue}>{t('rentPage.dueNowShownBeforeCheckout')}</span>
                      <span className={styles.trustCue}>{t('rentPage.hostedPaymentExperience')}</span>
                      <span className={styles.trustCue}>{t('rentPage.pickupContextIncluded')}</span>
                    </div>
                    <div className={styles.resultActionRow}>
                      <Link
                        href={`${withSiteBase(basePath, `/rent/${result?.vehicleType?.id || ''}`)}?${searchParamsToString({
                          pickupLocationId: form.pickupLocationId,
                          returnLocationId: form.returnLocationId,
                          pickupAt: form.pickupAt,
                          returnAt: form.returnAt,
                          vehicleTypeId: result?.vehicleType?.id || ''
                        })}`}
                        className={styles.resultPrimaryAction}
                        style={{ textDecoration: 'none' }}
                      >
                        {t('rentPage.viewDetails')}
                      </Link>
                      <Link
                        href={`${withSiteBase(basePath, '/checkout')}?${buildUnifiedCheckoutQuery({
                          pickupLocationId: form.pickupLocationId,
                          returnLocationId: form.returnLocationId,
                          pickupAt: form.pickupAt,
                          returnAt: form.returnAt,
                          vehicleTypeId: result?.vehicleType?.id || ''
                        })}`}
                        className={styles.resultSecondaryAction}
                        style={{ textDecoration: 'none' }}
                      >
                        {t('rentPage.reserveNow')}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <section className="glass card" style={{ padding: 24 }}>
            <div className="label">{t('rentPage.results')}</div>
            <p className="ui-muted" style={{ marginBottom: 0 }}>
              {t('rentPage.runSearchPrompt')}
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

export default function RentPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading...</div>}>
      <RentPreviewPageContent />
    </Suspense>
  );
}
