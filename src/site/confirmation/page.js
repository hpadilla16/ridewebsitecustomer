'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../sitePreviewPremium.module.css';
import { fmtMoney, resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const CONFIRMATION_KEY = 'ride_storefront_booking_confirmation';

function readConfirmationPayload() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CONFIRMATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function amountFrom(payload, keys = []) {
  for (const key of keys) {
    const value = key.split('.').reduce((current, part) => current?.[part], payload);
    if (value !== undefined && value !== null && value !== '') {
      const amount = Number(value || 0);
      if (!Number.isNaN(amount)) return amount;
    }
  }
  return 0;
}

function actionFor(payload, key) {
  const action = payload?.nextActions?.[key];
  if (!action || typeof action !== 'object') return null;
  return action;
}

export default function ConfirmationPage() {
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [mounted, setMounted] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setMounted(true);
    setConfirmation(readConfirmationPayload());
  }, []);

  const bookingType = confirmation?.bookingType === 'CAR_SHARING' ? 'Car Sharing' : 'Rental';
  const reference = confirmation?.trip?.tripCode || confirmation?.reservation?.reservationNumber || '-';
  const guestName = `${confirmation?.customer?.firstName || ''} ${confirmation?.customer?.lastName || ''}`.trim() || '-';
  const total = amountFrom(confirmation, [
    'pricingBreakdown.guestTotal',
    'pricingBreakdown.reservationEstimate',
    'trip.quotedTotal',
    'reservation.estimatedTotal'
  ]);
  const dueNow = amountFrom(confirmation, [
    'pricingBreakdown.dueNow',
    'pricingBreakdown.depositDueNow',
    'pricingBreakdown.depositDue',
    'pricingBreakdown.amountDueNow',
    'reservation.amountDueNow',
    'trip.amountDueNow'
  ]);
  const paymentAction = actionFor(confirmation, 'payment');
  const customerInfoAction = actionFor(confirmation, 'customerInfo');
  const signatureAction = actionFor(confirmation, 'signature');
  const confirmationEmail = confirmation?.confirmationEmail || null;
  const actionCards = [
    paymentAction?.link ? {
      key: 'payment',
      title: 'Pay now',
      body: 'Move into the hosted payment step and finish the due-now portion of the trip.',
      href: paymentAction.link
    } : null,
    customerInfoAction?.link ? {
      key: 'customer',
      title: 'Complete customer info',
      body: 'Finish personal details, license, and trip information before pickup.',
      href: customerInfoAction.link
    } : null,
    signatureAction?.link ? {
      key: 'signature',
      title: 'Open agreement signature',
      body: 'Continue the digital agreement and signature handoff.',
      href: signatureAction.link
    } : null
  ].filter(Boolean);

  if (!mounted) {
    return (
      <div className="stack" style={{ gap: 24 }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">Confirmation</span>
          <h1 style={{ marginTop: 8, marginBottom: 8 }}>Loading confirmation...</h1>
          <p className={styles.detailLead} style={{ maxWidth: 820 }}>
            Finishing the reservation summary and loading the next guest actions.
          </p>
        </section>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="stack" style={{ gap: 24 }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">Confirmation</span>
          <h1 style={{ marginTop: 8, marginBottom: 8 }}>Reservation saved</h1>
          <p className={styles.detailLead} style={{ maxWidth: 820 }}>
            This browser session does not have the confirmation payload anymore, but the reservation may still exist in Ride Fleet.
          </p>
          <div className={styles.detailRibbon}>
            <span className={styles.detailRibbonChip}>Email confirmation may still have been sent</span>
            <span className={styles.detailRibbonChip}>Check the guest inbox for next-step links</span>
          </div>
        </section>

        <section className="glass card-lg section-card">
          <div className="surface-note">
            <strong>No confirmation payload found</strong>
            <div className="ui-muted" style={{ marginTop: 6 }}>
              Go back to the storefront to start another booking flow, or use the guest email links that were already sent.
            </div>
          </div>
          <div className={styles.resultActionRow}>
            <Link href={withSiteBase(basePath, '/rent')} className={styles.resultPrimaryAction} style={{ textDecoration: 'none' }}>
              Back to rentals
            </Link>
            <Link href={withSiteBase(basePath, '/car-sharing')} className={styles.resultSecondaryAction} style={{ textDecoration: 'none' }}>
              Browse car sharing
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <span className="eyebrow">Booking Confirmed</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>{`${bookingType} ${reference} created`}</h1>
        <p className={styles.detailLead} style={{ maxWidth: 820 }}>
          The reservation is now live in Ride Fleet. Use the next action below to move the guest into payment, customer info, and digital signature without sending them back into internal tools.
        </p>
        <div className={styles.detailRibbon}>
          <span className={styles.detailRibbonChip}>{bookingType}</span>
          <span className={styles.detailRibbonChip}>Reference {reference}</span>
          <span className={styles.detailRibbonChip}>
            {confirmationEmail?.emailSent ? `Email sent to ${confirmation?.customer?.email || '-'}` : `Email status: ${confirmationEmail?.warning ? 'warning' : 'pending'}`}
          </span>
          <span className={styles.detailRibbonChip}>{dueNow > 0 ? `Due now ${fmtMoney(dueNow)}` : 'No payment due right now'}</span>
        </div>
      </section>

      <section className={styles.detailGrid}>
        <div className={`glass card-lg ${styles.contentPanel}`}>
          <div className="section-title">Confirmation Summary</div>
          <div className={styles.checkoutSummaryPanel}>
            <div className="label">Payment status</div>
            <div className={styles.checkoutSummaryRow}>
              <span>Estimated total</span>
              <strong>{fmtMoney(total)}</strong>
            </div>
            <div className={styles.checkoutSummaryRow}>
              <span>Due now</span>
              <strong>{fmtMoney(dueNow)}</strong>
            </div>
            <div className={styles.checkoutSummaryRow}>
              <span>Next move</span>
              <strong>{paymentAction?.link && dueNow > 0 ? 'Send guest to payment' : 'Review next steps below'}</strong>
            </div>
          </div>

          <div className="metric-grid">
            <div className="metric-card">
              <span className="label">Type</span>
              <strong>{bookingType}</strong>
            </div>
            <div className="metric-card">
              <span className="label">Reference</span>
              <strong>{reference}</strong>
            </div>
            <div className="metric-card">
              <span className="label">Guest</span>
              <strong>{guestName}</strong>
            </div>
            <div className="metric-card">
              <span className="label">Estimated total</span>
              <strong>{fmtMoney(total)}</strong>
            </div>
            <div className="metric-card">
              <span className="label">Due now</span>
              <strong>{fmtMoney(dueNow)}</strong>
            </div>
          </div>

          <div className={styles.storyCard}>
            <div className="label">Guest communication</div>
            <h3 style={{ margin: '8px 0 10px' }}>
              {confirmationEmail?.emailSent ? 'Confirmation email has been sent' : 'Confirmation email status'}
            </h3>
            <p className="ui-muted" style={{ margin: 0 }}>
              {confirmationEmail?.emailSent
                ? <>Ride Fleet sent the guest their reservation confirmation and next-step links to <strong>{confirmation?.customer?.email || '-'}</strong>.</>
                : confirmationEmail?.warning
                  ? <>{confirmationEmail.warning}</>
                  : <>Ride Fleet is still processing the reservation confirmation email for <strong>{confirmation?.customer?.email || '-'}</strong>.</>}
            </p>
          </div>

          <div className={styles.reassurancePanel}>
            <div className="label">Recommended sequence</div>
            <div className={styles.reassuranceChecklist}>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>Review customer info and reservation details</span></div>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>Send the guest into payment if there is an amount due now</span></div>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>Finish signature and pre-check-in links from the confirmation actions</span></div>
            </div>
          </div>
        </div>

        <div className={`glass card-lg ${styles.asidePanel}`}>
          <div className={styles.detailAsideHero}>
            <span className="label">Next Actions</span>
            <strong>Guide the guest into the next digital step without sending them back into operations tools.</strong>
          </div>

          {actionCards.length ? actionCards.map((action) => (
            <a key={action.key} href={action.href} target="_blank" rel="noreferrer" className={styles.confirmationActionCard} style={{ textDecoration: 'none' }}>
              <strong>{action.title}</strong>
              <div className="ui-muted" style={{ marginTop: 6 }}>{action.body}</div>
            </a>
          )) : (
            <div className="surface-note">
              <strong>No public next step links were returned</strong>
              <div className="ui-muted" style={{ marginTop: 6 }}>
                This booking completed, but the API did not return public actions for payment or follow-up.
              </div>
            </div>
          )}

          {paymentAction?.link ? (
            <a href={paymentAction.link} target="_blank" rel="noreferrer" className={styles.checkoutPrimaryButton} style={{ textDecoration: 'none' }}>
              Pay now
            </a>
          ) : null}

          <Link href={withSiteBase(basePath, '/rent')} className={styles.checkoutGhostButton} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Back to storefront
          </Link>
        </div>
      </section>
    </div>
  );
}
