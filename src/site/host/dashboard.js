'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const TRIP_STATUS_COLORS = {
  CONFIRMED: 'rgba(15, 176, 216, 0.18)',
  ACTIVE: 'rgba(80, 200, 120, 0.18)',
  COMPLETED: 'rgba(136, 151, 211, 0.16)',
  CANCELLED: 'rgba(255, 80, 80, 0.14)',
  PENDING: 'rgba(255, 194, 88, 0.18)',
  PENDING_APPROVAL: 'rgba(255, 194, 88, 0.18)',
  DISPUTED: 'rgba(255, 80, 80, 0.22)',
};

const LISTING_STATUS_COLORS = {
  PUBLISHED: 'rgba(80, 200, 120, 0.18)',
  DRAFT: 'rgba(136, 151, 211, 0.16)',
  PAUSED: 'rgba(255, 194, 88, 0.18)',
  ARCHIVED: 'rgba(136, 151, 211, 0.10)',
};

function statusLabel(s) {
  return s ? String(s).replace(/_/g, ' ') : 'Unknown';
}

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return (
    <span style={{ color: '#f5a623', letterSpacing: 2 }}>
      {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
    </span>
  );
}

export default function HostDashboardPage() {
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

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Host header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <span className="eyebrow">Host Dashboard</span>
          <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2847' }}>
            {profile?.displayName || user?.name || 'Host'}
          </h1>
          {profile && (
            <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.88rem', color: '#6b7a9a' }}>
              <span>{profile.email}</span>
              {profile.averageRating > 0 && <span><StarRating rating={profile.averageRating} /> ({profile.reviewCount})</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/host/listings" className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px' }}>My Listings</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(110,73,255,.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: '#6e49ff', fontWeight: 600, fontSize: '0.85rem' }}>Sign out</button>
        </div>
      </div>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>Loading your dashboard...</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', marginBottom: 18 }}>{error}</div>}

      {!loading && dashboard && (
        <>
          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Active Listings', value: metrics.publishedListings ?? 0 },
              { label: 'Total Trips', value: metrics.totalTrips ?? 0 },
              { label: 'Active Trips', value: metrics.activeTrips ?? 0 },
              { label: 'Completed', value: metrics.completedTrips ?? 0 },
              { label: 'Avg Rating', value: profile?.averageRating ? Number(profile.averageRating).toFixed(1) : '—' },
              { label: 'Reviews', value: profile?.reviewCount ?? 0 },
            ].map((m) => (
              <div key={m.label} className="glass card" style={{ padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e2847', marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Quick nav */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <Link href="/host/listings" className={styles.checkoutPrimaryButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>Manage Listings</Link>
            <Link href="/host/trips" className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>View Trips</Link>
            <Link href="/host/messages" className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>Messages</Link>
            <Link href="/host/reviews" className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>Reviews</Link>
            <Link href="/host/earnings" className={styles.checkoutGhostButton} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>Earnings</Link>
          </div>

          {/* Recent Listings */}
          <section className="glass card-lg" style={{ padding: '24px 22px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>Your Listings</h2>
              <Link href="/host/listings" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 600 }}>View all →</Link>
            </div>
            {!listings.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem' }}>No listings yet. Submit a vehicle to get started.</div>}
            <div style={{ display: 'grid', gap: 12 }}>
              {listings.slice(0, 4).map((listing) => (
                <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.95rem' }}>{listing.title || 'Untitled Listing'}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7a9a', marginTop: 2 }}>
                      {listing.vehicle ? `${listing.vehicle.year || ''} ${listing.vehicle.make || ''} ${listing.vehicle.model || ''}`.trim() : 'No vehicle'}
                      {listing.baseDailyRate ? ` · ${fmtMoney(listing.baseDailyRate)}/day` : ''}
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: LISTING_STATUS_COLORS[listing.status] || 'rgba(136,151,211,.14)', color: '#1e2847' }}>
                    {statusLabel(listing.status)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Trips */}
          <section className="glass card-lg" style={{ padding: '24px 22px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>Recent Trips</h2>
              <Link href="/host/trips" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 600 }}>View all →</Link>
            </div>
            {!trips.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem' }}>No trips yet.</div>}
            <div style={{ display: 'grid', gap: 10 }}>
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: 'rgba(135,82,254,.02)', border: '1px solid rgba(135,82,254,.06)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e2847', fontSize: '0.9rem' }}>
                      {trip.tripCode || trip.id?.slice(0, 8)}
                      {trip.guest ? ` · ${trip.guest.firstName || ''} ${trip.guest.lastName || ''}`.trim() : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7a9a', marginTop: 2 }}>
                      {trip.listing?.title || ''}
                      {trip.scheduledPickupAt ? ` · ${formatPublicDateTime(trip.scheduledPickupAt)}` : ''}
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: TRIP_STATUS_COLORS[trip.status] || 'rgba(136,151,211,.14)', color: '#1e2847' }}>
                    {statusLabel(trip.status)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <section className="glass card-lg" style={{ padding: '24px 22px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>Recent Reviews</h2>
                <Link href="/host/reviews" style={{ fontSize: '0.84rem', color: '#6e49ff', fontWeight: 600 }}>View all →</Link>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <StarRating rating={review.rating} />
                        <span style={{ marginLeft: 8, fontWeight: 600, color: '#1e2847', fontSize: '0.9rem' }}>{review.reviewerName || 'Guest'}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#6b7a9a' }}>{review.submittedAt ? formatPublicDateTime(review.submittedAt) : ''}</span>
                    </div>
                    {review.comments && <p style={{ margin: '8px 0 0', color: '#53607b', fontSize: '0.88rem', lineHeight: 1.5 }}>{review.comments}</p>}
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
