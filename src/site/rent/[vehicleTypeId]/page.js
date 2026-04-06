'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/client';
import { addDays, buildUnifiedCheckoutQuery, fmtMoney, formatPublicDateTime, publicLocationLabel, resolveSiteBasePath, searchParamsToString, toLocalInputValue, vehicleTypeLabel, withSiteBase } from '../../sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

function RentalDetailPreviewContent() {
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
        const boot = await api('/api/public/booking/bootstrap');
        setBootstrap(boot);
        const firstLocationId = boot?.locations?.[0]?.id || '';
        const payload = await api('/api/public/booking/rental-search', {
          method: 'POST',
          body: JSON.stringify({
            pickupLocationId: pickupLocationId || firstLocationId,
            returnLocationId: returnLocationId || pickupLocationId || firstLocationId,
            pickupAt,
            returnAt
          })
        });
        const match = (payload?.results || []).find((entry) => String(entry?.vehicleType?.id || '') === vehicleTypeId) || null;
        setResult(match);
        if (!match) {
          setError('This vehicle type is not currently available for the selected trip window.');
        } else {
          setError('');
        }
      } catch (err) {
        setResult(null);
        setError(String(err?.message || 'Unable to load rental detail.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [pickupAt, pickupLocationId, returnAt, returnLocationId, vehicleTypeId]);

  const location = result?.location || bootstrap?.locations?.find((entry) => String(entry.id) === String(pickupLocationId)) || null;
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
    { title: 'Airport-ready', body: 'Clear pickup expectations and faster arrival confidence.' },
    { title: 'Payment-trusted', body: 'Hosted checkout language keeps the handoff feel secure.' },
    { title: 'Ops-backed', body: 'Real availability and pricing still come from Ride Fleet.' }
  ];
  const rentalHighlights = [
    'Priority airport pickup framing',
    'Clear due-now language before checkout',
    'Premium storefront backed by real availability'
  ];
  const rentalProofSignals = [
    'Hosted payment confidence',
    'Live class availability',
    'Pickup details before checkout'
  ];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <div className={styles.detailHeroGrid}>
          <div className="stack" style={{ gap: 12 }}>
            <span className="eyebrow">Rental Detail</span>
            <h1 className={styles.detailTitle}>{result ? vehicleTypeLabel(result.vehicleType) : 'Rental option'}</h1>
            <p className={styles.detailLead}>
              A more refined product page between search and checkout, designed to make airport-ready rentals feel clearer, calmer, and easier to trust.
            </p>
            <div className={styles.detailRibbon}>
              <span className={styles.detailRibbonChip}>Airport pickup ready</span>
              <span className={styles.detailRibbonChip}>Ops-backed availability</span>
              <span className={styles.detailRibbonChip}>Digital checkout handoff</span>
            </div>
            <div className={styles.highlightStrip}>
              {rentalHighlights.map((item) => (
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
              <span className="label">Storefront posture</span>
              <strong>Premium arrival story + trusted hosted payment</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailGrid}>
        <div className={`glass card ${styles.contentPanel}`}>
          {loading ? <div className="ui-muted">Loading rental option...</div> : null}
          {!loading && error ? <div className="label" style={{ color: '#b91c1c' }}>{error}</div> : null}
          {!loading && result ? (
            <div className="stack" style={{ gap: 16 }}>
              <div className="surface-note">
                <strong>Pickup hub</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
              <div className={styles.storyCard}>
                <div className="label">Guest fit</div>
                <h3 style={{ margin: '8px 0 10px' }}>Built for airport arrivals and a more premium trip handoff</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  This page should feel closer to premium travel retail: cleaner pricing, stronger pickup context, and less guesswork before the guest commits.
                </p>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <span className="label">Daily rate</span>
                  <strong>{fmtMoney(result?.quote?.dailyRate)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Trip total</span>
                  <strong>{fmtMoney(result?.quote?.estimatedTripTotal)}</strong>
                </div>
                <div className="metric-card">
                  <span className="label">Due now</span>
                  <strong>{fmtMoney(result?.quote?.depositAmountDue)}</strong>
                </div>
              </div>
              <div className="surface-note">
                <strong>Trip window</strong>
                <div className="ui-muted">{formatPublicDateTime(pickupAt)} {'->'} {formatPublicDateTime(returnAt)}</div>
              </div>
              <div className="surface-note">
                <strong>Availability snapshot</strong>
                <div className="ui-muted">{Number(result?.availabilityCount || 0)} units available in this class for the selected trip window.</div>
              </div>
              <div className="surface-note">
                <strong>Why guests pick this class</strong>
                <div className="ui-muted">
                  Built for travelers who want a cleaner storefront story before checkout: clear daily pricing, calmer due-now expectations, and a more confident airport-ready pickup flow.
                </div>
              </div>
              <div className={styles.highlightStrip}>
                {rentalProofSignals.map((item) => (
                  <span key={item} className={styles.highlightChip}>{item}</span>
                ))}
              </div>
              <div className={styles.experiencePanel}>
                <div className="label">Signature Experience</div>
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
                <div className="label">Concierge framing</div>
                <h3 style={{ margin: '8px 0 10px' }}>Position the class like a hospitality product, not just a booking result</h3>
                <p className="ui-muted" style={{ margin: 0 }}>
                  Help guests understand what they will pay now, how pickup works, and why this class fits an airport-first journey before they ever touch forms.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className={`glass card ${styles.asidePanel}`}>
          <div className={styles.detailAsideHero}>
            <span className="label">Premium trip summary</span>
            <strong>Cleaner due-now language, stronger pickup confidence, and one trusted checkout handoff.</strong>
          </div>
          <span className="eyebrow">Next Step</span>
          <div className="surface-note">
            <strong>Why this page matters</strong>
            <div className="ui-muted">Guests get a cleaner product story before they hit fees, forms, and checkout.</div>
          </div>
          <div className="surface-note">
            <strong>Website goal</strong>
            <div className="ui-muted">This becomes the merchandised detail page that replaces generic booking results with a more intentional, premium reservation narrative.</div>
          </div>
          <div className={styles.detailCtaStack}>
            <Link href={`${withSiteBase(basePath, '/checkout')}?${checkoutQuery}`} className="ios-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Reserve this class
            </Link>
            <Link href={`/checkout?${checkoutQuery}`} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Open checkout
            </Link>
            <Link href={`${withSiteBase(basePath, '/rent')}?${backQuery}`} className="button-subtle" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to rental results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RentalDetailPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading rental detail...</div>}>
      <RentalDetailPreviewContent />
    </Suspense>
  );
}
