'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { formatPublicDateTime, fmtMoney } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
  PENDING_APPROVAL: 'Pending Approval',
};

const STATUS_COLORS = {
  CONFIRMED: 'rgba(15, 176, 216, 0.18)',
  ACTIVE: 'rgba(80, 200, 120, 0.18)',
  COMPLETED: 'rgba(136, 151, 211, 0.16)',
  CANCELLED: 'rgba(255, 80, 80, 0.14)',
  PENDING: 'rgba(255, 194, 88, 0.18)',
  PENDING_APPROVAL: 'rgba(255, 194, 88, 0.18)',
};

function statusLabel(status) {
  return STATUS_LABELS[status] || (status ? String(status).replace(/_/g, ' ') : 'Unknown');
}

function statusColor(status) {
  return STATUS_COLORS[status] || 'rgba(136, 151, 211, 0.14)';
}

function readLocalStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearGuestSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('ride_guest_token');
    window.localStorage.removeItem('ride_guest_customer');
  } catch {
    // ignore
  }
}

function vehicleLabel(booking) {
  const v = booking?.vehicle;
  if (!v) return booking?.vehicleTypeName || booking?.vehicleType?.name || null;
  return [v.year, v.make, v.model].filter(Boolean).join(' ') || null;
}

function bookingReference(booking) {
  return booking?.tripCode || booking?.reservationNumber || booking?.reference || booking?.id || '';
}

export default function AccountPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const storedToken = readLocalStorage('ride_guest_token');
    const storedCustomerRaw = readLocalStorage('ride_guest_customer');
    let storedCustomer = null;
    try {
      storedCustomer = storedCustomerRaw ? JSON.parse(storedCustomerRaw) : null;
    } catch {
      storedCustomer = null;
    }
    setToken(storedToken);
    setCustomer(storedCustomer);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await api('/api/public/booking/guest-signin/verify', {
          method: 'POST',
          body: JSON.stringify({ token: storedToken }),
        });
        if (cancelled) return;
        if (data?.customer) {
          setCustomer(data.customer);
          try {
            window.localStorage.setItem('ride_guest_customer', JSON.stringify(data.customer));
          } catch { /* ignore */ }
        }
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Unable to load your trips. Your session may have expired.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  function handleSignOut() {
    clearGuestSession();
    router.replace('/login');
  }

  if (!mounted || loading) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">My Trips</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            Loading your trips...
          </h1>
          <p className={styles.detailLead}>Fetching your booking history.</p>
        </section>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto', padding: '64px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">My Trips</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            Sign in to view your trips
          </h1>
          <p className={styles.detailLead}>
            Access your booking history, trip status, and support by signing in with your email.
          </p>
        </section>
        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <p className="ui-muted" style={{ margin: 0, lineHeight: 1.7 }}>
              We use secure, password-free sign-in links. Enter your email and we will send you access instantly.
            </p>
            <Link
              href="/login"
              className={styles.checkoutPrimaryButton}
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Sign in to view trips
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';
  const guestName = [firstName, lastName].filter(Boolean).join(' ') || 'Guest';
  const guestEmail = customer?.email || '';

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <span className="eyebrow">My Trips</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
          {guestName ? `Welcome back, ${firstName || guestName}` : 'Your trips'}
        </h1>
        {guestEmail && (
          <p className={styles.detailLead} style={{ maxWidth: 480 }}>
            Signed in as <strong>{guestEmail}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button
            type="button"
            onClick={handleSignOut}
            className={styles.heroSecondaryAction}
            style={{
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.07)',
              fontSize: '0.88rem',
            }}
          >
            Sign out
          </button>
        </div>
      </section>

      {error && (
        <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', borderRadius: 14, padding: '14px 18px' }}>
          <strong style={{ color: '#ff6b6b' }}>Could not load trips</strong>
          <div className="ui-muted" style={{ marginTop: 6 }}>{error}</div>
          <Link href="/login" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(15,176,216,0.9)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
            Sign in again &rarr;
          </Link>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <div className="surface-note">
            <strong>No trips found</strong>
            <div className="ui-muted" style={{ marginTop: 6 }}>
              No bookings are linked to this account yet. If you recently booked, make sure you signed in with the same email used at checkout.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link href="/rent" className={styles.resultPrimaryAction} style={{ textDecoration: 'none' }}>
              Browse vehicles
            </Link>
            <Link href="/car-sharing" className={styles.resultSecondaryAction} style={{ textDecoration: 'none' }}>
              Car sharing
            </Link>
          </div>
        </section>
      )}

      {bookings.length > 0 && (
        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 20 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>
            {bookings.length === 1 ? '1 Trip' : `${bookings.length} Trips`}
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {bookings.map((booking, idx) => {
              const ref = bookingReference(booking);
              const label = vehicleLabel(booking);
              const total = booking?.quotedTotal ?? booking?.estimatedTotal ?? booking?.total ?? null;
              const issueHref = `/account/issue?reference=${encodeURIComponent(ref)}&email=${encodeURIComponent(guestEmail)}`;

              return (
                <div
                  key={booking?.id || ref || idx}
                  className={styles.confirmationActionCard}
                  style={{ display: 'grid', gap: 12, cursor: 'default' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {ref && (
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                          {ref}
                        </span>
                      )}
                      {label && (
                        <span className="ui-muted" style={{ fontSize: '0.9rem' }}>{label}</span>
                      )}
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      background: statusColor(booking?.status),
                      border: '1px solid rgba(136,151,211,0.18)',
                    }}>
                      {statusLabel(booking?.status)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {booking?.pickupAt && (
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span className="label" style={{ fontSize: '0.72rem' }}>Pickup</span>
                        <span style={{ fontSize: '0.9rem' }}>{formatPublicDateTime(booking.pickupAt)}</span>
                      </div>
                    )}
                    {booking?.returnAt && (
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span className="label" style={{ fontSize: '0.72rem' }}>Return</span>
                        <span style={{ fontSize: '0.9rem' }}>{formatPublicDateTime(booking.returnAt)}</span>
                      </div>
                    )}
                    {total !== null && total !== undefined && (
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span className="label" style={{ fontSize: '0.72rem' }}>Total</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fmtMoney(total)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href={issueHref}
                      className={styles.resultSecondaryAction}
                      style={{ textDecoration: 'none', fontSize: '0.84rem', padding: '8px 16px' }}
                    >
                      Report an Issue
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="surface-note" style={{ borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="ui-muted" style={{ fontSize: '0.88rem' }}>
            Not seeing the right trips? Make sure you used the correct email at checkout.
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'rgba(15, 176, 216, 0.9)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Switch account &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
