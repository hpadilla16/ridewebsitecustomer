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
  const [expandedTrip, setExpandedTrip] = useState(null);

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

  const trips = dashboard?.trips || [];
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const pendingTrips = trips.filter((t) => ['CONFIRMED', 'ACTIVE', 'IN_PROGRESS', 'PENDING_APPROVAL', 'READY_FOR_PICKUP'].includes(t.status));
  const totalEarnings = completedTrips.reduce((sum, t) => sum + Number(t.hostEarnings || t.hostPayout || t.totalPrice || 0), 0);
  const totalPlatformFees = completedTrips.reduce((sum, t) => sum + Number(t.platformFee || 0), 0);
  const totalServiceFees = completedTrips.reduce((sum, t) => sum + Number(t.hostServiceFee || 0), 0);
  const totalGross = completedTrips.reduce((sum, t) => sum + Number(t.hostGrossRevenue || t.quotedTotal || 0), 0);
  const pendingEarnings = pendingTrips.reduce((sum, t) => sum + Number(t.hostEarnings || t.hostPayout || t.totalPrice || 0), 0);

  const allEarningsTrips = [...completedTrips, ...pendingTrips].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/host/dashboard" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← {t('host.dashboard')}</Link>
      <h1 style={{ margin: '4px 0 24px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('hostEarnings.title')}</h1>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('common.loading')}</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>{error}</div>}

      {!loading && dashboard && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
            <div className="glass card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e2847', marginTop: 4 }}>{fmtMoney(totalGross)}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', marginTop: 2 }}>{completedTrips.length} completed trips</div>
            </div>
            <div className="glass card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>Service Fees</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>-{fmtMoney(totalServiceFees)}</div>
            </div>
            <div className="glass card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>Platform Fees</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>-{fmtMoney(totalPlatformFees)}</div>
            </div>
            <div className="glass card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('hostEarnings.totalEarned')}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857', marginTop: 4 }}>{fmtMoney(totalEarnings)}</div>
            </div>
            <div className="glass card" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', fontWeight: 600, textTransform: 'uppercase' }}>{t('hostEarnings.pending')}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: 4 }}>{fmtMoney(pendingEarnings)}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7a9a', marginTop: 2 }}>{pendingTrips.length} upcoming</div>
            </div>
          </div>

          {/* Trips with commission breakdown */}
          <section className="glass card-lg" style={{ padding: '24px 22px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1e2847' }}>{t('hostEarnings.earningsHistory')}</h2>
            {!allEarningsTrips.length && <div style={{ color: '#6b7a9a', fontSize: '0.9rem' }}>{t('hostEarnings.noCompleted')}</div>}
            <div style={{ display: 'grid', gap: 10 }}>
              {allEarningsTrips.map((trip) => {
                const isCompleted = trip.status === 'COMPLETED';
                const gross = Number(trip.hostGrossRevenue || trip.quotedTotal || 0);
                const serviceFee = Number(trip.hostServiceFee || 0);
                const platformFee = Number(trip.platformFee || 0);
                const earnings = Number(trip.hostEarnings || trip.hostPayout || trip.totalPrice || 0);
                const serviceFeeRate = Number(trip.hostServiceFeeRate || 0);
                const guestFee = Number(trip.guestTripFee || 0);
                const isExpanded = expandedTrip === trip.id;

                return (
                  <div key={trip.id} style={{ borderRadius: 12, background: 'rgba(135,82,254,.02)', border: '1px solid rgba(135,82,254,.06)', overflow: 'hidden' }}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
                      onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, color: '#1e2847', fontSize: '0.9rem' }}>
                            {trip.tripCode || trip.id?.slice(0, 8)}
                          </span>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: 8,
                            background: isCompleted ? 'rgba(4,120,87,.08)' : 'rgba(180,83,9,.08)',
                            color: isCompleted ? '#047857' : '#b45309'
                          }}>
                            {trip.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7a9a', marginTop: 2 }}>
                          {trip.listing?.title || ''}
                          {trip.guestCustomer ? ` · ${trip.guestCustomer.firstName || ''} ${trip.guestCustomer.lastName || ''}`.trim() : ''}
                          {trip.completedAt ? ` · ${formatPublicDateTime(trip.completedAt)}` : trip.scheduledPickupAt ? ` · ${formatPublicDateTime(trip.scheduledPickupAt)}` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: isCompleted ? '#047857' : '#b45309', fontSize: '1rem' }}>
                          {fmtMoney(earnings)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7a9a' }}>
                          {isExpanded ? '▲ Hide' : '▼ Details'}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(135,82,254,.06)' }}>
                        <div style={{ display: 'grid', gap: 6, paddingTop: 12, fontSize: '0.88rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#53607b' }}>
                            <span>Gross Revenue</span>
                            <span style={{ fontWeight: 600, color: '#1e2847' }}>{fmtMoney(gross)}</span>
                          </div>
                          {Number(trip.quotedSubtotal || 0) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#53607b', fontSize: '0.82rem', paddingLeft: 12 }}>
                              <span>Base ({trip.quotedDays || '-'} days)</span>
                              <span>{fmtMoney(trip.quotedSubtotal)}</span>
                            </div>
                          )}
                          {Number(trip.cleaningFee || trip.listing?.cleaningFee || 0) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#53607b', fontSize: '0.82rem', paddingLeft: 12 }}>
                              <span>Cleaning Fee</span>
                              <span>{fmtMoney(trip.cleaningFee || trip.listing?.cleaningFee)}</span>
                            </div>
                          )}
                          {guestFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#53607b', fontSize: '0.82rem', paddingLeft: 12 }}>
                              <span>Guest Trip Fee</span>
                              <span>{fmtMoney(guestFee)}</span>
                            </div>
                          )}
                          {serviceFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                              <span>Service Fee{serviceFeeRate > 0 ? ` (${serviceFeeRate}%)` : ''}</span>
                              <span style={{ fontWeight: 600 }}>-{fmtMoney(serviceFee)}</span>
                            </div>
                          )}
                          {platformFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                              <span>Platform Fee</span>
                              <span style={{ fontWeight: 600 }}>-{fmtMoney(platformFee)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 6, marginTop: 2 }}>
                            <span style={{ fontWeight: 700, color: '#1e2847' }}>Your Earnings</span>
                            <span style={{ fontWeight: 800, color: '#047857' }}>{fmtMoney(earnings)}</span>
                          </div>
                          {trip.payoutHoldUntil && new Date(trip.payoutHoldUntil) > new Date() && (
                            <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: 2 }}>
                              Payout held until {formatPublicDateTime(trip.payoutHoldUntil)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
