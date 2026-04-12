'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const TRIP_STATUS_COLORS = {
  CONFIRMED: '#0fb0d8',
  RESERVED: '#6e49ff',
  INQUIRY: '#b45309',
  READY_FOR_PICKUP: '#047857',
  IN_PROGRESS: '#047857',
  COMPLETED: '#6b7a9a',
  CANCELLED: '#991b1b',
  DISPUTED: '#991b1b',
};

const LISTING_STATUS_COLORS = {
  PUBLISHED: '#047857',
  DRAFT: '#6b7a9a',
  PAUSED: '#b45309',
  ARCHIVED: '#6b7a9a',
};

function statusLabel(s) {
  return s ? String(s).replace(/_/g, ' ') : 'Unknown';
}

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return (
    <span style={{ color: '#f5a623', letterSpacing: 2, fontSize: '1rem' }}>
      {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
    </span>
  );
}

export default function HostDashboardPage() {
  const { t } = useTranslation();
  const { token, user, ready, logout } = useHostAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await hostApi('/dashboard', { bypassCache: true }, token);
        if (!cancelled) setDashboard(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ready, token]);

  if (!ready) return null;

  const profile = dashboard?.hostProfile;
  const metrics = dashboard?.metrics || {};
  const listings = dashboard?.listings || [];
  const trips = dashboard?.trips || [];
  const reviews = dashboard?.recentReviews || [];
  const totalEarned = (trips.filter(t => t.status === 'COMPLETED') || []).reduce((sum, t) => sum + Number(t.quotedTotal || 0), 0);
  const pendingEarnings = (trips.filter(t => ['CONFIRMED', 'RESERVED', 'IN_PROGRESS', 'READY_FOR_PICKUP'].includes(t.status)) || []).reduce((sum, t) => sum + Number(t.quotedTotal || 0), 0);
  const listingsWithPhotos = listings.filter(l => l.photoUrls?.[0] || l.vehicle?.imageUrl);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Premium hero header */}
      <div className={styles.heroShell} style={{ padding: '36px 40px', marginBottom: 28, borderRadius: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(200,210,255,.8)', marginBottom: 6 }}>{t('host.dashboard')}</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {profile?.displayName || user?.name || 'Host'}
            </h1>
            {profile && (
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.9rem', color: 'rgba(220,225,255,.85)', flexWrap: 'wrap', alignItems: 'center' }}>
                {profile.email && <span>{profile.email}</span>}
                {profile.averageRating > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={profile.averageRating} />
                    <span style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.84rem' }}>({profile.reviewCount} reviews)</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/host/listings" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,.25)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', backdropFilter: 'blur(8px)' }}>{t('host.myListings')}</Link>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', color: 'rgba(255,255,255,.85)', fontWeight: 600, fontSize: '0.85rem', backdropFilter: 'blur(8px)' }}>{t('common.signOut')}</button>
          </div>
        </div>

        {/* Earnings snapshot inside hero */}
        {!loading && dashboard && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 28 }}>
            {[
              { label: t('host.activeListings'), value: metrics.publishedListings ?? 0 },
              { label: t('host.totalTrips'), value: metrics.totalTrips ?? 0 },
              { label: 'Total Earned', value: fmtMoney(totalEarned) },
              { label: 'Pending', value: fmtMoney(pendingEarnings) },
              { label: t('host.avgRating'), value: profile?.averageRating ? `${Number(profile.averageRating).toFixed(1)} ★` : '—' },
            ].map((m) => (
              <div key={m.label} style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(200,210,255,.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="glass card-lg" style={{ textAlign: 'center', color: '#6b7a9a', padding: 40 }}>Loading your dashboard...</div>}
      {!loading && error && <div className="glass card-lg" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', padding: 24, marginBottom: 18 }}>{error}</div>}

      {!loading && dashboard && (
        <>
          {/* Vehicle gallery */}
          {listingsWithPhotos.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem', fontWeight: 800, color: '#1e2847' }}>Your Fleet</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {listingsWithPhotos.slice(0, 6).map((listing) => {
                  const photo = listing.photoUrls?.[0] || listing.vehicle?.imageUrl;
                  return (
                    <Link key={listing.id} href="/host/listings" style={{ textDecoration: 'none' }}>
                      <div className="glass card" style={{ overflow: 'hidden', padding: 0, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                        {photo && (
                          <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: 'linear-gradient(180deg, rgba(255,255,255,.96), rgba(244,246,255,.92))' }}>
                            <img src={photo} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                          </div>
                        )}
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.92rem', marginBottom: 4 }}>{listing.title || 'Vehicle'}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 700 }}>
                              {listing.baseDailyRate ? `${fmtMoney(listing.baseDailyRate)}/day` : ''}
                            </span>
                            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: LISTING_STATUS_COLORS[listing.status] || '#6b7a9a', background: `${LISTING_STATUS_COLORS[listing.status] || '#6b7a9a'}18` }}>
                              {statusLabel(listing.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { href: '/host/listings', label: t('host.manageListings'), icon: '🚗' },
              { href: '/host/trips', label: t('host.viewTrips'), icon: '📋' },
              { href: '/host/messages', label: t('common.messages'), icon: '💬' },
              { href: '/host/reviews', label: t('common.reviews'), icon: '⭐' },
              { href: '/host/earnings', label: t('common.earnings'), icon: '💰' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="glass card" style={{ display: 'grid', placeItems: 'center', gap: 8, padding: '20px 16px', textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s ease' }}>
                <span style={{ fontSize: '1.6rem' }}>{action.icon}</span>
                <span style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.88rem' }}>{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Two-column layout: Trips + Reviews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>

            {/* Recent Trips */}
            <section className="glass card-lg" style={{ padding: '24px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{t('host.recentTrips')}</h2>
                <Link href="/host/trips" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 700, textDecoration: 'none' }}>View all →</Link>
              </div>
              {!trips.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem', padding: '16px 0' }}>{t('host.noTrips')}</div>}
              <div style={{ display: 'grid', gap: 10 }}>
                {trips.slice(0, 5).map((trip) => (
                  <div key={trip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 14, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.9rem' }}>
                        {trip.tripCode || trip.id?.slice(0, 8)}
                        {trip.guest ? ` · ${trip.guest.firstName || ''} ${trip.guest.lastName || ''}`.trim() : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7a9a', marginTop: 3 }}>
                        {trip.listing?.title || ''}
                        {trip.scheduledPickupAt ? ` · ${formatPublicDateTime(trip.scheduledPickupAt)}` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: TRIP_STATUS_COLORS[trip.status] || '#6b7a9a', background: `${TRIP_STATUS_COLORS[trip.status] || '#6b7a9a'}18` }}>
                      {statusLabel(trip.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Reviews */}
            <section className="glass card-lg" style={{ padding: '24px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{t('host.recentReviews')}</h2>
                <Link href="/host/reviews" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 700, textDecoration: 'none' }}>View all →</Link>
              </div>
              {!reviews.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem', padding: '16px 0' }}>No reviews yet. Reviews will appear here after guests rate your trips.</div>}
              <div style={{ display: 'grid', gap: 12 }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating rating={review.rating} />
                        <span style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.88rem' }}>{review.reviewerName || 'Guest'}</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#6b7a9a' }}>{review.submittedAt ? formatPublicDateTime(review.submittedAt) : ''}</span>
                    </div>
                    {review.comments && <p style={{ margin: '8px 0 0', color: '#53607b', fontSize: '0.86rem', lineHeight: 1.55 }}>"{review.comments}"</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Listings list (if no photos for gallery) */}
          {!listingsWithPhotos.length && listings.length > 0 && (
            <section className="glass card-lg" style={{ padding: '24px 22px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{t('host.yourListings')}</h2>
                <Link href="/host/listings" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 700, textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {listings.slice(0, 4).map((listing) => (
                  <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.92rem' }}>{listing.title || 'Untitled Listing'}</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7a9a', marginTop: 2 }}>
                        {listing.vehicle ? `${listing.vehicle.year || ''} ${listing.vehicle.make || ''} ${listing.vehicle.model || ''}`.trim() : 'No vehicle'}
                        {listing.baseDailyRate ? ` · ${fmtMoney(listing.baseDailyRate)}/day` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: LISTING_STATUS_COLORS[listing.status] || '#6b7a9a', background: `${LISTING_STATUS_COLORS[listing.status] || '#6b7a9a'}18` }}>
                      {statusLabel(listing.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
