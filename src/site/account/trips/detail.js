'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

const STATUS_COLORS = {
  CONFIRMED: 'rgba(15, 176, 216, 0.18)',
  ACTIVE: 'rgba(80, 200, 120, 0.18)',
  COMPLETED: 'rgba(136, 151, 211, 0.16)',
  CANCELLED: 'rgba(255, 80, 80, 0.14)',
  PENDING: 'rgba(255, 194, 88, 0.18)',
  PENDING_APPROVAL: 'rgba(255, 194, 88, 0.18)',
};

const STATUS_KEYS = {
  CONFIRMED: 'status.confirmed',
  ACTIVE: 'status.active',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
  PENDING: 'status.pending',
  PENDING_APPROVAL: 'status.pendingApproval',
};

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return <span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}</span>;
}

function readGuestToken() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem('ride_guest_token'); } catch { return null; }
}

export default function TripDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [booking, setBooking] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');
  const [showExtend, setShowExtend] = useState(false);
  const [extendDays, setExtendDays] = useState(1);
  const [extendMsg, setExtendMsg] = useState('');

  function statusLabel(s) {
    const key = STATUS_KEYS[s];
    if (key) return t(key);
    return s ? String(s).replace(/_/g, ' ') : t('account.unknown');
  }

  useEffect(() => {
    const guestToken = readGuestToken();
    if (!guestToken) { router.replace('/login'); return; }
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/public/booking/guest-signin/verify', {
          method: 'POST',
          body: JSON.stringify({ token: guestToken }),
        });
        if (cancelled) return;
        const bookings = data?.bookings || [];
        setAllBookings(bookings);
        const match = bookings.find((b) =>
          b.reference === ref || b.reservationNumber === ref || b.tripCode === ref || b.id === ref
        );
        if (match) setBooking(match);
        else setError(t('account.tripNotFound'));
      } catch (err) {
        if (!cancelled) setError(err?.message || t('account.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ref, router, t]);

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>{t('account.loadingTripDetails')}</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
        <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>{t('account.backToTrips')}</Link>
        <div className="surface-note" style={{ marginTop: 16, borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>
          {error || t('account.tripNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>{t('account.backToTrips')}</Link>

      {/* Header */}
      <section className={`glass card-lg ${styles.detailHero}`} style={{ marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">{booking.type === 'CAR_SHARING' ? t('account.carSharingTrip') : t('account.rentalReservation')}</span>
            <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>
              {booking.reference || booking.reservationNumber}
            </h1>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', background: STATUS_COLORS[booking.status] || 'rgba(136,151,211,.14)', color: '#1e2847' }}>
            {statusLabel(booking.status)}
          </span>
        </div>
      </section>

      {/* Vehicle */}
      <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('account.vehicle')}</h2>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>{booking.vehicleLabel || t('account.vehicle')}</div>
      </section>

      {/* Schedule */}
      <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('account.schedule')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('account.pickup')}</div>
            <div style={{ fontWeight: 600, color: '#1e2847', marginTop: 4 }}>{booking.pickupAt ? formatPublicDateTime(booking.pickupAt) : '—'}</div>
            {booking.pickupLocationName && <div style={{ fontSize: '0.84rem', color: '#53607b', marginTop: 2 }}>{booking.pickupLocationName}</div>}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('account.return')}</div>
            <div style={{ fontWeight: 600, color: '#1e2847', marginTop: 4 }}>{booking.returnAt ? formatPublicDateTime(booking.returnAt) : '—'}</div>
          </div>
        </div>
      </section>

      {/* Host (car sharing only) */}
      {booking.host && (
        <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('account.yourHost')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
              {(booking.host.displayName || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e2847' }}>{booking.host.displayName}</div>
              {booking.host.averageRating > 0 && (
                <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>
                  <StarRating rating={booking.host.averageRating} /> ({booking.host.reviewCount} {t('common.reviews').toLowerCase()})
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('account.pricing')}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#53607b' }}>{t('account.estimatedTotal')}</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e2847' }}>{fmtMoney(booking.estimatedTotal || 0)}</span>
        </div>
      </section>

      {/* Cancellation policy */}
      {['CONFIRMED', 'PENDING', 'PENDING_APPROVAL', 'NEW'].includes(booking.status) && (
        <section className="glass card" style={{ padding: '16px 20px', marginBottom: 16, fontSize: '0.86rem', color: '#53607b', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: '#1e2847', marginBottom: 4 }}>{t('account.cancellationPolicy')}</div>
          <div>{booking.type === 'CAR_SHARING'
            ? t('account.carSharingCancelPolicy')
            : t('account.rentalCancelPolicy')}
          </div>
        </section>
      )}

      {cancelMsg && <div className="surface-note" style={{ marginBottom: 12, color: cancelMsg.includes('cancelled') || cancelMsg.includes('cancelad') ? '#047857' : '#991b1b' }}>{cancelMsg}</div>}

      {/* Actions */}
      <section style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={handlePrint} className={styles.checkoutGhostButton} style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
          {t('account.printReceipt')}
        </button>
        <Link href={`/account/issue?reference=${encodeURIComponent(ref)}`} className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>
          {t('common.reportIssue')}
        </Link>
        {['CONFIRMED', 'PENDING', 'PENDING_APPROVAL', 'NEW'].includes(booking.status) && (
          <button
            onClick={async () => {
              if (!confirm(t('account.cancelConfirm'))) return;
              try {
                await api('/api/public/booking/cancel', { method: 'POST', body: JSON.stringify({ reference: ref }) });
                setCancelMsg(t('account.bookingCancelled'));
                setBooking((b) => b ? { ...b, status: 'CANCELLED' } : b);
              } catch (err) {
                setCancelMsg(err?.message || t('account.unableToCancel'));
              }
            }}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {t('account.cancelBooking')}
          </button>
        )}
        {['CONFIRMED', 'ACTIVE', 'IN_PROGRESS'].includes(booking.status) && (
          <button
            onClick={() => setShowExtend(!showExtend)}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.06)', color: '#047857', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {t('account.extendTrip')}
          </button>
        )}
      </section>

      {/* Extend trip form */}
      {showExtend && (
        <section className="glass card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#1e2847' }}>{t('account.requestExtension')}</h3>
          <p style={{ fontSize: '0.84rem', color: '#6b7a9a', margin: '0 0 12px' }}>
            {t('account.extensionHint')}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div className="label">{t('account.extraDays')}</div>
              <select value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} style={{ minWidth: 100 }}>
                {[1, 2, 3, 5, 7, 14].map((d) => <option key={d} value={d}>{d} {d === 1 ? t('account.day') : t('account.days')}</option>)}
              </select>
            </div>
            <button
              onClick={async () => {
                try {
                  await api('/api/public/booking/extend', { method: 'POST', body: JSON.stringify({ reference: ref, extraDays: extendDays }) });
                  setExtendMsg(t('account.extensionSubmitted', { days: extendDays }));
                  setShowExtend(false);
                } catch (err) {
                  setExtendMsg(err?.message || t('account.unableToExtend'));
                }
              }}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {t('account.submitRequest')}
            </button>
          </div>
          {extendMsg && <div style={{ marginTop: 10, fontSize: '0.84rem', color: extendMsg.includes('submitted') || extendMsg.includes('enviada') ? '#047857' : '#991b1b' }}>{extendMsg}</div>}
        </section>
      )}
    </div>
  );
}
