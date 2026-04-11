'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

function readGuestToken() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem('ride_guest_token'); } catch { return null; }
}

function readCustomer() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem('ride_guest_customer') || 'null'); } catch { return null; }
}

function StarSelector({ value, onChange, t }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '2rem', color: star <= value ? '#f5a623' : '#d1d5db',
            transition: 'color 0.15s',
          }}
          aria-label={`${star} ${star > 1 ? t('accountReviews.stars') : t('accountReviews.star')}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return <span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}</span>;
}

export default function GuestReviewsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const [pendingReviews, setPendingReviews] = useState([]);
  const [activeToken, setActiveToken] = useState(tokenParam);
  const [reviewPrompt, setReviewPrompt] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load pending reviews from guest session
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
        setPendingReviews(data?.pendingReviews || []);
        if (!activeToken && data?.pendingReviews?.[0]?.token) {
          setActiveToken(data.pendingReviews[0].token);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || t('accountReviews.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Load review prompt when token selected
  useEffect(() => {
    if (!activeToken) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/public/booking/host-reviews/${encodeURIComponent(activeToken)}`);
        if (!cancelled) {
          setReviewPrompt(data);
          if (data?.review?.status === 'SUBMITTED') {
            setRating(data.review.rating || 0);
            setComments(data.review.comments || '');
          }
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || t('accountReviews.loadError'));
      }
    })();
    return () => { cancelled = true; };
  }, [activeToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1 || rating > 5) { setError(t('accountReviews.selectRating')); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await api(`/api/public/booking/host-reviews/${encodeURIComponent(activeToken)}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comments: comments.trim() || null }),
      });
      setSuccess(t('accountReviews.thankYou'));
      setReviewPrompt((prev) => prev ? { ...prev, review: { ...prev.review, status: 'SUBMITTED', rating, comments }, host: result?.host || prev?.host } : prev);
      // Remove from pending list
      setPendingReviews((prev) => prev.filter((r) => r.token !== activeToken));
    } catch (err) {
      setError(err?.message || t('accountReviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>{t('accountReviews.loadingReviews')}</div>
      </div>
    );
  }

  const isSubmitted = reviewPrompt?.review?.status === 'SUBMITTED';
  const trip = reviewPrompt?.trip;
  const host = reviewPrompt?.host;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>{t('accountReviews.backToTrips')}</Link>
      <h1 style={{ margin: '4px 0 20px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('accountReviews.title')}</h1>

      {error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', marginBottom: 14 }}>{error}</div>}
      {success && <div className="surface-note" style={{ borderColor: 'rgba(80,200,120,0.28)', background: 'rgba(80,200,120,0.07)', color: '#047857', marginBottom: 14 }}>{success}</div>}

      {/* Pending reviews list */}
      {pendingReviews.length > 0 && (
        <section className="glass card-lg" style={{ padding: '20px', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e2847' }}>{t('accountReviews.pendingReviews')}</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {pendingReviews.map((pr) => (
              <button
                key={pr.id}
                onClick={() => { setActiveToken(pr.token); setSuccess(''); setError(''); setRating(0); setComments(''); setReviewPrompt(null); }}
                style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  border: activeToken === pr.token ? '2px solid #6e49ff' : '1px solid rgba(135,82,254,.1)',
                  background: activeToken === pr.token ? 'rgba(110,73,255,.06)' : 'transparent',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.9rem' }}>{pr.hostDisplayName || 'Host'}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b7a9a' }}>{pr.tripCode}{pr.listingTitle ? ` · ${pr.listingTitle}` : ''}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {!pendingReviews.length && !activeToken && (
        <div className="surface-note" style={{ color: '#6b7a9a', textAlign: 'center' }}>
          {t('accountReviews.noPending')}
        </div>
      )}

      {/* Review form / submitted view */}
      {reviewPrompt && (
        <section className="glass card-lg" style={{ padding: '24px 22px' }}>
          {/* Trip context */}
          {trip && (
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(135,82,254,.08)' }}>
              <span className="eyebrow">{t('accountReviews.reviewFor')}</span>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e2847' }}>{trip.listingTitle || trip.vehicleLabel || trip.tripCode}</h2>
              <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 4 }}>
                {t('accountReviews.tripLabel')} {trip.tripCode}
                {trip.scheduledPickupAt ? ` · ${formatPublicDateTime(trip.scheduledPickupAt)}` : ''}
                {trip.locationName ? ` · ${trip.locationName}` : ''}
              </div>
            </div>
          )}

          {/* Host info */}
          {host && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8752FE, #6d3df2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                {(host.displayName || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e2847' }}>{host.displayName}</div>
                {host.averageRating > 0 && <div style={{ fontSize: '0.84rem', color: '#6b7a9a' }}><StarDisplay rating={host.averageRating} /> ({host.reviewCount} {t('common.reviews').toLowerCase()})</div>}
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <StarDisplay rating={reviewPrompt.review.rating} />
              <p style={{ marginTop: 12, fontSize: '1rem', fontWeight: 600, color: '#1e2847' }}>{t('accountReviews.reviewSubmitted')}</p>
              {reviewPrompt.review.comments && <p style={{ color: '#53607b', fontSize: '0.9rem', lineHeight: 1.6 }}>"{reviewPrompt.review.comments}"</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
              <div>
                <div className="label" style={{ marginBottom: 8 }}>{t('accountReviews.howWasExperience')}</div>
                <StarSelector value={rating} onChange={setRating} t={t} />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>{t('accountReviews.commentsOptional')}</div>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t('accountReviews.commentsPlaceholder')}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                className={styles.checkoutPrimaryButton}
                disabled={submitting || rating < 1}
                style={{ justifySelf: 'start', fontSize: '0.9rem', padding: '12px 28px' }}
              >
                {submitting ? t('common.submitting') : t('accountReviews.submitReview')}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
