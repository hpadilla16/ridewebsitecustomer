'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

function statusLabel(s) { return s ? String(s).replace(/_/g, ' ') : 'Unknown'; }

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return <span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}</span>;
}

function readGuestToken() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem('ride_guest_token'); } catch { return null; }
}

export default function TripDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [booking, setBooking] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');

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
        else setError('Trip not found. It may have been removed or the reference is incorrect.');
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load trip details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ref, router]);

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>Loading trip details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
        <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← My Trips</Link>
        <div className="surface-note" style={{ marginTop: 16, borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>
          {error || 'Trip not found'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← My Trips</Link>

      {/* Header */}
      <section className={`glass card-lg ${styles.detailHero}`} style={{ marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">{booking.type === 'CAR_SHARING' ? 'Car Sharing Trip' : 'Rental Reservation'}</span>
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
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>Vehicle</h2>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>{booking.vehicleLabel || 'Vehicle'}</div>
      </section>

      {/* Schedule */}
      <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>Schedule</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>Pickup</div>
            <div style={{ fontWeight: 600, color: '#1e2847', marginTop: 4 }}>{booking.pickupAt ? formatPublicDateTime(booking.pickupAt) : '—'}</div>
            {booking.pickupLocationName && <div style={{ fontSize: '0.84rem', color: '#53607b', marginTop: 2 }}>{booking.pickupLocationName}</div>}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>Return</div>
            <div style={{ fontWeight: 600, color: '#1e2847', marginTop: 4 }}>{booking.returnAt ? formatPublicDateTime(booking.returnAt) : '—'}</div>
          </div>
        </div>
      </section>

      {/* Host (car sharing only) */}
      {booking.host && (
        <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>Your Host</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
              {(booking.host.displayName || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e2847' }}>{booking.host.displayName}</div>
              {booking.host.averageRating > 0 && (
                <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>
                  <StarRating rating={booking.host.averageRating} /> ({booking.host.reviewCount} reviews)
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>Pricing</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#53607b' }}>Estimated Total</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e2847' }}>{fmtMoney(booking.estimatedTotal || 0)}</span>
        </div>
      </section>

      {/* Cancellation policy */}
      {['CONFIRMED', 'PENDING', 'PENDING_APPROVAL', 'NEW'].includes(booking.status) && (
        <section className="glass card" style={{ padding: '16px 20px', marginBottom: 16, fontSize: '0.86rem', color: '#53607b', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: '#1e2847', marginBottom: 4 }}>Cancellation Policy</div>
          <div>{booking.type === 'CAR_SHARING'
            ? 'Free cancellation up to 24 hours before pickup. Late cancellations may incur a fee.'
            : 'Free cancellation up to 48 hours before pickup. Late cancellations may forfeit the deposit.'}
          </div>
        </section>
      )}

      {cancelMsg && <div className="surface-note" style={{ marginBottom: 12, color: cancelMsg.includes('cancelled') ? '#047857' : '#991b1b' }}>{cancelMsg}</div>}

      {/* Actions */}
      <section style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={handlePrint} className={styles.checkoutGhostButton} style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
          Print Receipt
        </button>
        <Link href={`/account/issue?reference=${encodeURIComponent(ref)}`} className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>
          Report an Issue
        </Link>
        {['CONFIRMED', 'PENDING', 'PENDING_APPROVAL', 'NEW'].includes(booking.status) && (
          <button
            onClick={async () => {
              if (!confirm('Are you sure you want to cancel this booking? This may incur a cancellation fee.')) return;
              try {
                await api('/api/public/booking/cancel', { method: 'POST', body: JSON.stringify({ reference: ref }) });
                setCancelMsg('Booking cancelled successfully. Refund will be processed per our cancellation policy.');
                setBooking((b) => b ? { ...b, status: 'CANCELLED' } : b);
              } catch (err) {
                setCancelMsg(err?.message || 'Unable to cancel booking. Please contact support.');
              }
            }}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cancel Booking
          </button>
        )}
      </section>
    </div>
  );
}
