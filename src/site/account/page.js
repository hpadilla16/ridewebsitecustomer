'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { formatPublicDateTime, fmtMoney } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

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
  const { t } = useTranslation();
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
        setError(err?.message || t('account.loadError'));
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

  function statusLabel(status) {
    const key = STATUS_KEYS[status];
    if (key) return t(key);
    return status ? String(status).replace(/_/g, ' ') : t('account.unknown');
  }

  if (!mounted || loading) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">{t('account.title')}</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            {t('account.loadingTrips')}
          </h1>
          <p className={styles.detailLead}>{t('account.fetchingHistory')}</p>
        </section>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto', padding: '64px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">{t('account.title')}</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            {t('account.signInToViewTrips')}
          </h1>
          <p className={styles.detailLead}>
            {t('account.accessHistory')}
          </p>
        </section>
        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <p className="ui-muted" style={{ margin: 0, lineHeight: 1.7 }}>
              {t('account.passwordFreeExplanation')}
            </p>
            <Link
              href="/login"
              className={styles.checkoutPrimaryButton}
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              {t('account.signInToViewTripsButton')}
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
        <span className="eyebrow">{t('account.title')}</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
          {guestName ? t('account.welcome', { name: firstName || guestName }) : t('account.yourTrips')}
        </h1>
        {guestEmail && (
          <p className={styles.detailLead} style={{ maxWidth: 480 }}>
            {t('account.signedInAs', { email: guestEmail })}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Link href="/account/messages" className={styles.heroSecondaryAction} style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
            {t('common.messages')}
          </Link>
          <Link href="/account/reviews" className={styles.heroSecondaryAction} style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
            {t('common.leaveReview')}
          </Link>
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
            {t('common.signOut')}
          </button>
        </div>
      </section>

      {error && (
        <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', borderRadius: 14, padding: '14px 18px' }}>
          <strong style={{ color: '#ff6b6b' }}>{t('account.couldNotLoadTrips')}</strong>
          <div className="ui-muted" style={{ marginTop: 6 }}>{error}</div>
          <Link href="/login" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(15,176,216,0.9)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
            {t('account.signInAgain')}
          </Link>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <div className="surface-note">
            <strong>{t('account.noTrips')}</strong>
            <div className="ui-muted" style={{ marginTop: 6 }}>
              {t('account.noTripsHint')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link href="/rent" className={styles.resultPrimaryAction} style={{ textDecoration: 'none' }}>
              {t('account.browseVehicles')}
            </Link>
            <Link href="/car-sharing" className={styles.resultSecondaryAction} style={{ textDecoration: 'none' }}>
              {t('common.carSharing')}
            </Link>
          </div>
        </section>
      )}

      {bookings.length > 0 && (
        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 20 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>
            {bookings.length === 1 ? t('account.oneTrip') : t('account.trips', { count: bookings.length })}
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
                        <span className="label" style={{ fontSize: '0.72rem' }}>{t('account.pickup')}</span>
                        <span style={{ fontSize: '0.9rem' }}>{formatPublicDateTime(booking.pickupAt)}</span>
                      </div>
                    )}
                    {booking?.returnAt && (
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span className="label" style={{ fontSize: '0.72rem' }}>{t('account.return')}</span>
                        <span style={{ fontSize: '0.9rem' }}>{formatPublicDateTime(booking.returnAt)}</span>
                      </div>
                    )}
                    {total !== null && total !== undefined && (
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span className="label" style={{ fontSize: '0.72rem' }}>{t('checkout.total')}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fmtMoney(total)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link
                      href={`/account/trips?ref=${encodeURIComponent(ref)}`}
                      className={styles.resultSecondaryAction}
                      style={{ textDecoration: 'none', fontSize: '0.84rem', padding: '8px 16px' }}
                    >
                      {t('common.viewDetails')}
                    </Link>
                    <Link
                      href={issueHref}
                      className={styles.resultSecondaryAction}
                      style={{ textDecoration: 'none', fontSize: '0.84rem', padding: '8px 16px' }}
                    >
                      {t('common.reportIssue')}
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
            {t('account.notSeeingTrips')}
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
            {t('account.switchAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
