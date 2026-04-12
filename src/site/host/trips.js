'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const STATUS_COLORS = {
  CONFIRMED: 'rgba(15, 176, 216, 0.18)',
  ACTIVE: 'rgba(80, 200, 120, 0.18)',
  COMPLETED: 'rgba(136, 151, 211, 0.16)',
  CANCELLED: 'rgba(255, 80, 80, 0.14)',
  PENDING: 'rgba(255, 194, 88, 0.18)',
  PENDING_APPROVAL: 'rgba(255, 194, 88, 0.18)',
  DISPUTED: 'rgba(255, 80, 80, 0.22)',
};

function statusLabel(s) { return s ? String(s).replace(/_/g, ' ') : 'Unknown'; }

export default function HostTripsPage() {
  const { t } = useTranslation();
  const { token, ready } = useHostAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');

  async function load(statusFilter) {
    setLoading(true);
    try {
      const qs = statusFilter ? `?tripStatus=${statusFilter}` : '';
      const data = await hostApi(`/dashboard${qs}`, { bypassCache: true }, token);
      setTrips(data?.trips || []);
    } catch (err) {
      setError(err?.message || t('errors.unableToLoad'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !token) return;
    load(filter);
  }, [ready, token, filter]);

  async function updateStatus(tripId, status) {
    setMsg('');
    try {
      await hostApi(`/trips/${tripId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token);
      setMsg(t('hostTrips.tripUpdated', { status: statusLabel(status) }));
      load(filter);
    } catch (err) {
      setMsg(err?.message || t('errors.unableToLoad'));
    }
  }

  if (!ready) return null;

  const filters = ['', 'INQUIRY', 'RESERVED', 'CONFIRMED', 'READY_FOR_PICKUP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/host/dashboard" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← {t('host.dashboard')}</Link>
      <h1 style={{ margin: '4px 0 20px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('hostTrips.title')}</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f || 'ALL'}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(110,73,255,.15)',
              background: filter === f ? 'rgba(110,73,255,.12)' : 'transparent',
              color: filter === f ? '#6e49ff' : '#6b7a9a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            {f ? statusLabel(f) : t('hostTrips.all')}
          </button>
        ))}
      </div>

      {msg && <div className="surface-note" style={{ marginBottom: 14, color: msg.includes('updated') ? '#047857' : '#991b1b' }}>{msg}</div>}
      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('common.loading')}</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>{error}</div>}

      {!loading && trips.map((trip) => (
        <section key={trip.id} className="glass card" style={{ padding: '18px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.95rem' }}>
                {trip.tripCode || trip.id?.slice(0, 8)}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>
                {trip.guest ? `${trip.guest.firstName || ''} ${trip.guest.lastName || ''}`.trim() : t('hostTrips.noGuestInfo')}
                {trip.listing?.title ? ` · ${trip.listing.title}` : ''}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#53607b', marginTop: 4 }}>
                {trip.scheduledPickupAt && <>{t('hostTrips.pickup')}: {formatPublicDateTime(trip.scheduledPickupAt)}</>}
                {trip.scheduledReturnAt && <> · {t('hostTrips.return')}: {formatPublicDateTime(trip.scheduledReturnAt)}</>}
              </div>
              {trip.totalPrice != null && (
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e2847', marginTop: 4 }}>
                  {t('hostTrips.total')}: {fmtMoney(trip.totalPrice)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: STATUS_COLORS[trip.status] || 'rgba(136,151,211,.14)', color: '#1e2847' }}>
                {statusLabel(trip.status)}
              </span>
              {trip.status === 'PENDING_APPROVAL' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => updateStatus(trip.id, 'CONFIRMED')} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(80,200,120,.18)', color: '#047857', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>{t('hostTrips.approve')}</button>
                  <button onClick={() => updateStatus(trip.id, 'CANCELLED')} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,80,80,.14)', color: '#991b1b', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>{t('hostTrips.decline')}</button>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {!loading && !trips.length && !error && (
        <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('hostTrips.noTrips')}</div>
      )}
    </div>
  );
}
