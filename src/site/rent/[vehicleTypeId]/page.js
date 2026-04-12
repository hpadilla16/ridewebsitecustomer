'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/client';
import { addDays, backendLocationIdsForPublicOption, buildPublicLocationOptions, buildUnifiedCheckoutQuery, fetchBookingBootstrap, fmtMoney, formatPublicDateTime, publicLocationLabel, rentalResultImageList, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from '../../sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

function RentalDetailPreviewContent() {
  const { t } = useTranslation();
  const params = useParams();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const searchParams = useSearchParams();
  const vehicleTypeId = String(params?.vehicleTypeId || '');
  const [bootstrap, setBootstrap] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const pickupLocationId = String(searchParams.get('pickupLocationId') || '');
  const returnLocationId = String(searchParams.get('returnLocationId') || pickupLocationId);
  const pickupAt = String(searchParams.get('pickupAt') || toLocalInputValue(addDays(new Date(), 1)));
  const returnAt = String(searchParams.get('returnAt') || toLocalInputValue(addDays(new Date(), 4)));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const boot = await fetchBookingBootstrap();
        setBootstrap(boot);
        const publicLocationOptions = buildPublicLocationOptions(boot?.locations || []);
        const firstLocationId = publicLocationOptions[0]?.id || '';
        const pickupLocationIds = backendLocationIdsForPublicOption(publicLocationOptions, pickupLocationId || firstLocationId);
        const returnLocationIds = backendLocationIdsForPublicOption(publicLocationOptions, returnLocationId || pickupLocationId || firstLocationId);
        if (!pickupLocationIds.length) {
          throw new Error(t('rentDetail.pickupLocationNotFound'));
        }
        const payload = await api('/api/public/booking/rental-search', {
          method: 'POST',
          body: JSON.stringify({
            pickupLocationId: pickupLocationIds[0],
            pickupLocationIds,
            returnLocationId: returnLocationIds[0] || pickupLocationIds[0],
            returnLocationIds,
            pickupAt,
            returnAt
          })
        });
        const match = (payload?.results || []).find((entry) => String(entry?.vehicleType?.id || '') === vehicleTypeId) || null;
        setResult(match);
        if (!match) {
          setError(t('rentDetail.vehicleNotAvailable'));
        } else {
          setError('');
        }
      } catch (err) {
        setResult(null);
        setError(String(err?.message || t('rentDetail.unableToLoadDetail')));
      } finally {
        setLoading(false);
      }
    })();
  }, [pickupAt, pickupLocationId, returnAt, returnLocationId, vehicleTypeId]);

  const location = result?.location || bootstrap?.locations?.find((entry) => String(entry.id) === String(pickupLocationId)) || null;
  const gallery = rentalResultImageList(result);
  const checkoutQuery = buildUnifiedCheckoutQuery({
    pickupLocationId: result?.location?.id || pickupLocationId,
    returnLocationId: returnLocationId || result?.location?.id || pickupLocationId,
    pickupAt,
    returnAt,
    vehicleTypeId
  });
  const backQuery = searchParamsToString({
    pickupLocationId,
    returnLocationId,
    pickupAt,
    returnAt
  });
  const rentalExperience = [
    { title: t('rentDetail.experienceAirportReadyTitle'), body: t('rentDetail.experienceAirportReadyBody') },
    { title: t('rentDetail.experienceSecurePaymentsTitle'), body: t('rentDetail.experienceSecurePaymentsBody') },
    { title: t('rentDetail.experienceRealtimeTitle'), body: t('rentDetail.experienceRealtimeBody') }
  ];
  const rentalHighlights = [
    t('rentDetail.highlightPriorityPickup'),
    t('rentDetail.highlightDueNowPricing'),
    t('rentDetail.highlightTripProtection')
  ];
  const rentalProofSignals = [
    t('rentDetail.proofHostedPayment'),
    t('rentDetail.proofLiveAvailability'),
    t('rentDetail.proofPickupDetails')
  ];
  const nextSteps = [
    t('rentDetail.stepReviewPricing'),
    t('rentDetail.stepCompleteCheckout'),
    t('rentDetail.stepFinishAgreement')
  ];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <div className={styles.detailHeroGrid}>
          <div className="stack" style={{ gap: 12 }}>
            <span className="eyebrow">{t('rentDetail.eyebrow')}</span>
            <h1 className={styles.detailTitle}>{result ? vehicleTypeLabel(result.vehicleType) : t('rentDetail.rentalOption')}</h1>
            <p className={styles.detailLead}>
              {t('rentDetail.leadDescription')}
            </p>
            <div className={styles.detailRibbon}>
              <span className={styles.detailRibbonChip}>{t('rentDetail.ribbonAirportPickup')}</span>
              <span className={styles.detailRibbonChip}>{t('rentDetail.ribbonOpsAvailability')}</span>
              <span className={styles.detailRibbonChip}>{t('rentDetail.ribbonDigitalCheckout')}</span>
            </div>
            <div className={styles.highlightStrip}>
              {rentalHighlights.map((item) => (
                <span key={item} className={styles.highlightChip}>{item}</span>
              ))}
            </div>
          </div>
          <div className={styles.detailSnapshot}>
            <div className="label">{t('rentDetail.tripSnapshot')}</div>
            <div className={styles.detailSnapshotValue}>{formatPublicDateTime(pickupAt)}</div>
            <div className="ui-muted" style={{ marginTop: 6 }}>{t('rentDetail.returnLabel')} {formatPublicDateTime(returnAt)}</div>
            <div className="ui-muted" style={{ marginTop: 16 }}>{publicLocationLabel(location)}</div>
            <div className={styles.snapshotAccent}>
              <span className="label">{t('rentDetail.storefrontPosture')}</span>
              <strong>{t('rentDetail.storefrontPostureValue')}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailGrid}>
        <div className={`glass card ${styles.contentPanel}`}>
          {loading ? <div className="ui-muted">{t('rentDetail.loadingRentalOption')}</div> : null}
          {!loading && error ? <div className="label" style={{ color: '#b91c1c' }}>{error}</div> : null}
          {!loading && result ? (
            <div className="stack" style={{ gap: 16 }}>
              {gallery[0] ? (
                <div className={styles.galleryFrame}>
                  <Image
                    src={gallery[0]}
                    alt={vehicleTypeLabel(result.vehicleType)}
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
                <strong>{t('rentDetail.pickupHub')}</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
              <div className={styles.storyCard}>
                <div className="label">{t('rentDetail.guestFit')}</div>
                <h3 style={{ margin: '8px 0 10px' }}>{t('rentDetail.guestFitHeading')}</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  {t('rentDetail.guestFitDescription')}
                </p>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <span className="label">{t('rentDetail.dailyRate')}</span>
                  <strong>{fmtMoney(result?.quote?.dailyRate)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">{t('rentDetail.tripTotal')}</span>
                  <strong>{fmtMoney(result?.quote?.estimatedTripTotal)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">{t('rentDetail.dueNow')}</span>
                  <strong>{fmtMoney(result?.quote?.depositAmountDue)}</strong>
                </div>
              </div>
              <div className="surface-note">
                <strong>{t('rentDetail.tripWindow')}</strong>
                <div className="ui-muted">{formatPublicDateTime(pickupAt)} {'->'} {formatPublicDateTime(returnAt)}</div>
              </div>
              <div className="surface-note">
                <strong>{t('rentDetail.availabilitySnapshot')}</strong>
                <div className="ui-muted">{t('rentDetail.unitsAvailable', { count: Number(result?.availabilityCount || 0) })}</div>
              </div>
              <div className="surface-note">
                <strong>{t('rentDetail.whyGuestsPick')}</strong>
                <div className="ui-muted">
                  {t('rentDetail.whyGuestsPickDescription')}
                </div>
              </div>
              <div className={styles.highlightStrip}>
                {rentalProofSignals.map((item) => (
                  <span key={item} className={styles.highlightChip}>{item}</span>
                ))}
              </div>
              <div className={styles.experiencePanel}>
                <div className="label">{t('rentDetail.signatureExperience')}</div>
                <div className={styles.experienceGrid} style={{ marginTop: 12 }}>
                  {rentalExperience.map((item) => (
                    <div key={item.title} className={styles.experienceTile}>
                      <strong>{item.title}</strong>
                      <p className="ui-muted" style={{ margin: '8px 0 0' }}>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.conciergePanel}>
                <div className="label">{t('rentDetail.conciergeFraming')}</div>
                <h3 style={{ margin: '8px 0 10px' }}>{t('rentDetail.conciergeHeading')}</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  {t('rentDetail.conciergeDescription')}
                </p>
              </div>
              <div className={styles.reassurancePanel}>
                <div className="label">{t('rentDetail.whatHappensAfterReserve')}</div>
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
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <span className="label">{t('rentDetail.tripSummary')}</span>
              <strong style={{ fontSize: '1.1rem', color: '#1e2847' }}>{vehicleTypeLabel(result?.vehicleType)}</strong>
            </div>
            {result?.quote && (
              <div style={{ display: 'grid', gap: 8 }}>
                {Number(result.quote.dailyRate) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                    <span>{t('rentDetail.dailyRate')}</span><strong style={{ color: '#1e2847' }}>{fmtMoney(result.quote.dailyRate)}</strong>
                  </div>
                )}
                {Number(result.quote.estimatedTripTotal || result.quote.total) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                    <span>{t('rentDetail.estimatedTotal')}</span><strong style={{ color: '#1e2847' }}>{fmtMoney(result.quote.estimatedTripTotal || result.quote.total)}</strong>
                  </div>
                )}
                {Number(result.quote.depositAmountDue || result.deposit?.amountDue) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6e49ff' }}>
                    <span>{t('rentDetail.dueNow')}</span><strong>{fmtMoney(result.quote.depositAmountDue || result.deposit?.amountDue)}</strong>
                  </div>
                )}
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(114,126,170,.12)', paddingTop: 14 }}>
              <div style={{ fontSize: '0.82rem', color: '#6b7a9a', lineHeight: 1.5 }}>
                {t('rentDetail.pickupLocation')}: {publicLocationLabel(result?.location)}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b7a9a', marginTop: 4 }}>
                {formatPublicDateTime(pickupAt)} → {formatPublicDateTime(returnAt)}
              </div>
            </div>
          </div>
          <div className={styles.detailCtaStack}>
            <Link href={`${withSiteBase(basePath, '/checkout')}?${checkoutQuery}`} className="ios-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              {t('rentDetail.reserveThisClass')}
            </Link>
            <Link href={`${withSiteBase(basePath, '/rent')}?${backQuery}`} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
              {t('rentDetail.backToRentalResults')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RentalDetailPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading...</div>}>
      <RentalDetailPreviewContent />
    </Suspense>
  );
}
