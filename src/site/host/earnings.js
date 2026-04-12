'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';

export default function HostEarningsPage() {
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
  const trips = dashboard?.trips || [];
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const totalEarnings = completedTrips.reduce((sum, t) => sum + Number(t.hostPayout || t.totalPrice || 0), 0);
  const pendingTrips = trips.filter((t) => ['CONFIRMED', 'ACTIVE', 'PENDING_APPROVAL'].includes(t.status));
  const pendingEarnings = pendingTrips.reduce((sum, t) => sum + Number(t.hostPayout || t.totalPrice || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/host/dashboard" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← {t('host.dashboard')}</Link>
      <h1 style={{ margin: '4px 0 24px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('hostEarnings.title')}</h1>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('common.loading')}</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>{error}</div>}

      {!loading && dashboard && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
            <div className="glass card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('hostEarnings.totalEarned')}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857', marginTop: 6 }}>{fmtMoney(totalEarnings)}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7a9a', marginTop: 4 }}>{completedTrips.length} {t('hostEarnings.completedTrips')}</div>
            </div>
            <div className="glass card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('hostEarnings.pending')}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: 6 }}>{fmtMoney(pendingEarnings)}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7a9a', marginTop: 4 }}>{pendingTrips.length} {t('hostEarnings.upcomingTrips')}</div>
            </div>
          </div>

          {/* Completed trip earnings */}
          <section className="glass card-lg" style={{ padding: '24px 22px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>{t('hostEarnings.earningsHistory')}</h2>
            {!completedTrips.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem' }}>{t('hostEarnings.noCompleted')}</div>}
            <div style={{ display: 'grid', gap: 10 }}>
              {completedTrips.map((trip) => (
                <div key={trip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: 'rgba(135,82,254,.02)', border: '1px solid rgba(135,82,254,.06)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e2847', fontSize: '0.9rem' }}>
                      {trip.tripCode || trip.id?.slice(0, 8)}
                      {trip.guest ? ` · ${trip.guest.firstName || ''} ${trip.guest.lastName || ''}`.trim() : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7a9a', marginTop: 2 }}>
                      {trip.listing?.title || ''}
                      {trip.completedAt ? ` · ${formatPublicDateTime(trip.completedAt)}` : trip.scheduledReturnAt ? ` · ${formatPublicDateTime(trip.scheduledReturnAt)}` : ''}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#047857', fontSize: '1rem' }}>
                    {fmtMoney(trip.hostPayout || trip.totalPrice || 0)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
