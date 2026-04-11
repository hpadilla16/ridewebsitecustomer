'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { fmtMoney, formatPublicDateTime, normalizeImageList, withSiteBase, resolveSiteBasePath } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

function StarDisplay({ rating, count }) {
  const stars = Math.round(Number(rating || 0));
  return (
    <span>
      <span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}</span>
      {count != null && <span style={{ marginLeft: 6, color: '#6b7a9a', fontSize: '0.88rem' }}>({count})</span>}
    </span>
  );
}

export default function PublicHostProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const hostId = params?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hostId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/public/booking/hosts/${encodeURIComponent(hostId)}`);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || t('errors.unableToLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hostId]);

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !profile?.host) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>
          {error || t('hostProfile.hostNotFound')}
        </div>
      </div>
    );
  }

  const host = profile.host;
  const listings = profile.listings || [];
  const reviews = profile.reviews || [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      {/* Host header */}
      <section className={`glass card-lg ${styles.detailHero}`} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>
            {(host.displayName || '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{host.displayName}</h1>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: '0.88rem', color: '#6b7a9a', flexWrap: 'wrap' }}>
              {host.averageRating > 0 && <StarDisplay rating={host.averageRating} count={host.reviewCount} />}
              {host.completedTrips > 0 && <span>{host.completedTrips} {t('hostProfile.completedTrips')}</span>}
              {host.activeListings > 0 && <span>{host.activeListings} {t('hostProfile.activeListings')}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      {listings.length > 0 && (
        <section className="glass card-lg" style={{ padding: '24px 22px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>{t('hostProfile.vehicles')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {listings.map((listing) => {
              const images = normalizeImageList(listing.imageUrls?.length ? listing.imageUrls : listing.primaryImageUrl ? [listing.primaryImageUrl] : []);
              return (
                <Link
                  key={listing.id}
                  href={`/car-sharing/${listing.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(135,82,254,.08)', background: 'rgba(135,82,254,.02)' }}
                >
                  {images[0] && (
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56%' }}>
                      <Image src={images[0]} alt={listing.title || 'Vehicle'} fill style={{ objectFit: 'cover' }} sizes="300px" />
                    </div>
                  )}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.95rem' }}>{listing.title || t('hostProfile.carSharingListing')}</div>
                    {listing.vehicle && <div style={{ fontSize: '0.82rem', color: '#6b7a9a', marginTop: 2 }}>{[listing.vehicle.year, listing.vehicle.make, listing.vehicle.model].filter(Boolean).join(' ')}</div>}
                    {listing.baseDailyRate?.amount && <div style={{ fontWeight: 800, color: '#6e49ff', marginTop: 6 }}>{fmtMoney(listing.baseDailyRate.amount || listing.baseDailyRate)}/day</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="glass card-lg" style={{ padding: '24px 22px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>
            {t('hostProfile.guestReviews')} ({host.reviewCount || reviews.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(135,82,254,.03)', border: '1px solid rgba(135,82,254,.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <StarDisplay rating={review.rating} />
                    <span style={{ marginLeft: 8, fontWeight: 700, color: '#1e2847', fontSize: '0.9rem' }}>{review.reviewerName || t('host.guest')}</span>
                  </div>
                  {review.submittedAt && <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{formatPublicDateTime(review.submittedAt)}</span>}
                </div>
                {review.comments ? (
                  <p style={{ margin: 0, color: '#53607b', fontSize: '0.88rem', lineHeight: 1.6 }}>{review.comments}</p>
                ) : (
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.86rem', fontStyle: 'italic' }}>{t('hostReviews.noWrittenReview')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!reviews.length && (
        <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('hostProfile.noReviews')}</div>
      )}
    </div>
  );
}
