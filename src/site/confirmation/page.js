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

function buildActionCard(action, fallbackTitle, fallbackBody, variant = 'secondary') {
  if (!action?.link) return null;
  return {
    key: fallbackTitle.toLowerCase().replace(/\s+/g, '-'),
    title: action.label || fallbackTitle,
    body: fallbackBody,
    href: action.link,
    variant
  };
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
  const paymentCard = buildActionCard(paymentAction, 'Pay now', 'Move into the hosted payment step and finish the due-now portion of the trip.', 'payment');
  const customerCard = buildActionCard(customerInfoAction, 'Complete customer info', 'Finish personal details, license, and trip information before pickup.', 'customer');
  const signatureCard = buildActionCard(signatureAction, 'Open agreement signature', 'Continue the digital agreement and signature handoff.', 'signature');
  const primaryAction = dueNow > 0
    ? paymentCard || customerCard || signatureCard || null
    : customerCard || signatureCard || paymentCard || null;
  const actionCards = [paymentCard, customerCard, signatureCard].filter(Boolean);
  const secondaryActions = primaryAction
    ? actionCards.filter((action) => action.key !== primaryAction.key)
    : actionCards;
  const primaryActionBody = primaryAction?.variant === 'payment'
    ? `Continue into the hosted payment step${dueNow > 0 ? ` for ${fmtMoney(dueNow)}` : ''}.`
    : primaryAction?.variant === 'customer'
      ? 'Finish customer information so pre-check-in and payment links stay complete.'
      : primaryAction?.variant === 'signature'
        ? 'Move the guest into the digital agreement and signature step.'
        : 'Continue the reservation flow.';

  if (!mounted) {
    return (
      <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ color: '#6b7a9a', fontWeight: 600 }}>Loading your confirmation...</div>
      </main>
    );
  }

  if (!confirmation) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px', textAlign: 'center', display: 'grid', gap: 20 }}>
        <div style={{ fontSize: '2.4rem' }}>🔍</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e2847' }}>Booking not found in this session</h1>
        <p style={{ color: '#6b7a9a', lineHeight: 1.7 }}>
          The confirmation is no longer in your browser session. Check your email for the booking confirmation and next steps.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={withSiteBase(basePath, '/car-sharing')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6e49ff 55%,#0fb0d8)', color: '#fff', fontWeight: 800, textDecoration: 'none', boxShadow: '0 10px 24px rgba(110,73,255,.28)' }}>Browse more cars</Link>
          <Link href={withSiteBase(basePath, '/rent')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 20px', borderRadius: 14, border: '1.5px solid rgba(110,73,255,.18)', background: 'rgba(255,255,255,.9)', color: '#4a38be', fontWeight: 800, textDecoration: 'none' }}>Rental fleet</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(28px,5vw,52px) clamp(16px,4vw,24px) 60px', display: 'grid', gap: 24 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', display: 'grid', gap: 16, padding: '40px 24px', borderRadius: 24, background: 'linear-gradient(145deg, #f5f0ff, #faf7ff 60%, #f0fbf8)', border: '1px solid rgba(135,82,254,.1)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto', background: 'linear-gradient(135deg, rgba(22,163,74,.15), rgba(31,199,170,.12))', border: '2px solid rgba(22,163,74,.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎉</div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, letterSpacing: '-.02em', color: '#1a1230', margin: '0 0 10px' }}>You&apos;re all set!</h1>
          <p style={{ color: '#5f567e', lineHeight: 1.7, margin: 0 }}>{guestName !== '-' ? `${guestName}, your ` : 'Your '}{bookingType.toLowerCase()} reservation is confirmed.</p>
        </div>
        {/* Reference badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 999, background: 'rgba(255,255,255,.9)', border: '1px solid rgba(135,82,254,.18)', margin: '0 auto', boxShadow: '0 4px 14px rgba(135,82,254,.1)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.06em' }}>Booking ref</span>
          <span style={{ fontWeight: 900, color: '#1a1230', fontSize: '1.1rem', letterSpacing: '.04em' }}>{reference}</span>
        </div>
        {/* Email note */}
        {confirmation?.customer?.email && (
          <p style={{ fontSize: '0.88rem', color: '#6f668f', margin: 0 }}>
            A confirmation email has been sent to <strong style={{ color: '#1a1230' }}>{confirmation.customer.email}</strong>
          </p>
        )}
      </div>

      {/* Amounts */}
      {(total > 0 || dueNow > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {total > 0 && (
            <div style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,.92)', border: '1px solid rgba(135,82,254,.12)', boxShadow: '0 4px 14px rgba(135,82,254,.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Trip total</div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1a1230' }}>{fmtMoney(total)}</div>
            </div>
          )}
          {dueNow >= 0 && (
            <div style={{ padding: '18px 20px', borderRadius: 18, background: dueNow > 0 ? 'rgba(110,73,255,.06)' : 'rgba(22,163,74,.06)', border: `1px solid ${dueNow > 0 ? 'rgba(110,73,255,.16)' : 'rgba(22,163,74,.18)'}`, boxShadow: '0 4px 14px rgba(135,82,254,.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Due now</div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: dueNow > 0 ? '#4c1d95' : '#15803d' }}>{dueNow > 0 ? fmtMoney(dueNow) : 'Nothing'}</div>
            </div>
          )}
        </div>
      )}

      {/* Next steps */}
      <div style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Next steps</h2>
        {/* Primary action */}
        {primaryAction?.link && (
          <a href={primaryAction.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 20px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(110,73,255,.08), rgba(31,199,170,.06))', border: '1.5px solid rgba(110,73,255,.2)', textDecoration: 'none', transition: 'all 0.18s' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#1a1230', marginBottom: 4 }}>{primaryAction.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7a9a' }}>{primaryActionBody}</div>
            </div>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>→</span>
          </a>
        )}
        {/* Secondary actions */}
        {secondaryActions.map((action) => (
          action?.link && (
            <a key={action.key} href={action.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,.88)', border: '1px solid rgba(135,82,254,.12)', textDecoration: 'none' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1a1230', fontSize: '0.95rem' }}>{action.title}</div>
                <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>{action.body}</div>
              </div>
              <span style={{ color: '#6e49ff', fontWeight: 700, flexShrink: 0 }}>→</span>
            </a>
          )
        ))}
        {/* Primary CTA button if no inline link was shown */}
        {primaryAction?.link && (
          <a href={primaryAction.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6e49ff 55%,#0fb0d8)', color: '#fff', fontWeight: 900, fontSize: '1.02rem', textDecoration: 'none', boxShadow: '0 14px 30px rgba(110,73,255,.32)', letterSpacing: '.01em' }}>
            {primaryAction.title}
          </a>
        )}
        {!primaryAction && actionCards.length === 0 && (
          <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,.88)', border: '1px solid rgba(135,82,254,.1)', color: '#6b7a9a', fontSize: '0.9rem' }}>
            Check your confirmation email for next steps.
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
        <button onClick={() => { if (typeof window !== 'undefined') window.print(); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 46, padding: '0 22px', borderRadius: 14, border: '1.5px solid rgba(110,73,255,.18)', background: 'rgba(255,255,255,.9)', color: '#4a38be', fontWeight: 800, fontSize: '0.93rem', cursor: 'pointer' }}>Print Receipt</button>
        <Link href={withSiteBase(basePath, '/account')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 46, padding: '0 22px', borderRadius: 14, border: '1.5px solid rgba(110,73,255,.18)', background: 'rgba(255,255,255,.9)', color: '#4a38be', fontWeight: 800, textDecoration: 'none', fontSize: '0.93rem' }}>My Trips</Link>
        <Link href={withSiteBase(basePath, '/car-sharing')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 46, padding: '0 22px', borderRadius: 14, border: '1.5px solid rgba(110,73,255,.18)', background: 'rgba(255,255,255,.9)', color: '#4a38be', fontWeight: 800, textDecoration: 'none', fontSize: '0.93rem' }}>Browse More</Link>
      </div>

    </main>
  );
}
