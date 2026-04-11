'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { formatPublicDateTime } from '@/site/sitePreviewShared';

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return (
    <span style={{ color: '#f5a623', letterSpacing: 2 }}>
      {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
    </span>
  );
}

export default function HostReviewsPage() {
  const { t } = useTranslation();
  const { token, ready } = useHostAuth();
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
        if (!cancelled) setError(err?.message || t('errors.unableToLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ready, token]);

  if (!ready) return null;

  const profile = dashboard?.hostProfile;
  const reviews = dashboard?.recentReviews || [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/host/dashboard" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← {t('host.dashboard')}</Link>
      <h1 style={{ margin: '4px 0 24px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('hostReviews.title')}</h1>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('common.loading')}</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>{error}</div>}

      {!loading && profile && (
        <div className="glass card-lg" style={{ padding: '20px 22px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e2847' }}>
            {profile.averageRating ? Number(profile.averageRating).toFixed(1) : '—'}
          </div>
          <StarRating rating={profile.averageRating || 0} />
          <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 6 }}>{profile.reviewCount || 0} {t('hostReviews.totalReviews')}</div>
        </div>
      )}

      {!loading && reviews.map((review) => (
        <section key={review.id} className="glass card" style={{ padding: '18px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <StarRating rating={review.rating} />
              <span style={{ marginLeft: 8, fontWeight: 700, color: '#1e2847', fontSize: '0.95rem' }}>{review.reviewerName || t('host.guest')}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#6b7a9a' }}>{review.submittedAt ? formatPublicDateTime(review.submittedAt) : ''}</span>
          </div>
          {review.comments ? (
            <p style={{ margin: 0, color: '#53607b', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comments}</p>
          ) : (
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.88rem', fontStyle: 'italic' }}>{t('hostReviews.noWrittenReview')}</p>
          )}
        </section>
      ))}

      {!loading && !reviews.length && !error && (
        <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('hostReviews.noReviews')}</div>
      )}
    </div>
  );
}
