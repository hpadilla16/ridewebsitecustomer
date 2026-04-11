'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useHostAuth, hostApi } from '@/lib/useHostAuth';
import { fmtMoney, formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const STATUS_COLORS = {
  PUBLISHED: 'rgba(80, 200, 120, 0.18)',
  DRAFT: 'rgba(136, 151, 211, 0.16)',
  PAUSED: 'rgba(255, 194, 88, 0.18)',
  ARCHIVED: 'rgba(136, 151, 211, 0.10)',
};

function statusLabel(s) { return s ? String(s).replace(/_/g, ' ') : 'Unknown'; }

export default function HostListingsPage() {
  const { t } = useTranslation();
  const { token, ready, logout } = useHostAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

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

  const listings = dashboard?.listings || [];

  function startEdit(listing) {
    setEditId(listing.id);
    setEditForm({
      title: listing.title || '',
      baseDailyRate: listing.baseDailyRate || '',
      cleaningFee: listing.cleaningFee || '',
      deliveryFee: listing.deliveryFee || '',
      status: listing.status || 'DRAFT',
      description: listing.description || '',
      tripRules: listing.tripRules || '',
      instantBook: !!listing.instantBook,
      minTripDays: listing.minTripDays || 1,
      maxTripDays: listing.maxTripDays || '',
    });
    setMsg('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await hostApi(`/listings/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title,
          baseDailyRate: Number(editForm.baseDailyRate) || 0,
          cleaningFee: Number(editForm.cleaningFee) || 0,
          deliveryFee: Number(editForm.deliveryFee) || 0,
          status: editForm.status,
          description: editForm.description,
          tripRules: editForm.tripRules,
          instantBook: editForm.instantBook,
          minTripDays: Number(editForm.minTripDays) || 1,
          maxTripDays: editForm.maxTripDays ? Number(editForm.maxTripDays) : null,
        }),
      }, token);
      setMsg(t('host.listingUpdated'));
      setEditId(null);
      // Reload
      const data = await hostApi('/dashboard', { bypassCache: true }, token);
      setDashboard(data);
    } catch (err) {
      setMsg(err?.message || t('errors.unableToLoad'));
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link href="/host/dashboard" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← {t('host.dashboard')}</Link>
          <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>{t('host.myListings')}</h1>
        </div>
      </div>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>{t('common.loading')}</div>}
      {!loading && error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>{error}</div>}
      {msg && <div className="surface-note" style={{ marginBottom: 16, color: msg === t('host.listingUpdated') ? '#047857' : '#991b1b' }}>{msg}</div>}

      {!loading && listings.map((listing) => (
        <section key={listing.id} className="glass card-lg" style={{ padding: '22px 20px', marginBottom: 16 }}>
          {editId === listing.id ? (
            <form onSubmit={saveEdit} style={{ display: 'grid', gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{t('host.editListing')}</h3>
              <div className="form-grid-2">
                <div><div className="label">{t('host.title')}</div><input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} /></div>
                <div><div className="label">{t('host.status')}</div>
                  <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="DRAFT">{t('host.draft')}</option>
                    <option value="PUBLISHED">{t('host.published')}</option>
                    <option value="PAUSED">{t('host.paused')}</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-3">
                <div><div className="label">{t('host.dailyRate')}</div><input type="number" step="0.01" value={editForm.baseDailyRate} onChange={(e) => setEditForm((f) => ({ ...f, baseDailyRate: e.target.value }))} /></div>
                <div><div className="label">{t('host.cleaningFee')}</div><input type="number" step="0.01" value={editForm.cleaningFee} onChange={(e) => setEditForm((f) => ({ ...f, cleaningFee: e.target.value }))} /></div>
                <div><div className="label">{t('host.deliveryFee')}</div><input type="number" step="0.01" value={editForm.deliveryFee} onChange={(e) => setEditForm((f) => ({ ...f, deliveryFee: e.target.value }))} /></div>
              </div>
              <div className="form-grid-2">
                <div><div className="label">{t('host.minTripDays')}</div><input type="number" min="1" value={editForm.minTripDays} onChange={(e) => setEditForm((f) => ({ ...f, minTripDays: e.target.value }))} /></div>
                <div><div className="label">{t('host.maxTripDays')}</div><input type="number" min="0" value={editForm.maxTripDays} onChange={(e) => setEditForm((f) => ({ ...f, maxTripDays: e.target.value }))} placeholder={t('host.noLimit')} /></div>
              </div>
              <div><div className="label">{t('host.description')}</div><textarea rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} /></div>
              <div><div className="label">{t('host.tripRules')}</div><textarea rows={2} value={editForm.tripRules} onChange={(e) => setEditForm((f) => ({ ...f, tripRules: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.instantBook} onChange={(e) => setEditForm((f) => ({ ...f, instantBook: e.target.checked }))} />
                {t('host.instantBookEnabled')}
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className={styles.checkoutPrimaryButton} disabled={saving} style={{ fontSize: '0.85rem', padding: '10px 22px' }}>
                  {saving ? t('common.submitting') : t('host.saveChanges')}
                </button>
                <button type="button" className={styles.checkoutGhostButton} onClick={() => setEditId(null)} style={{ fontSize: '0.85rem', padding: '10px 22px' }}>{t('common.cancel')}</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '1rem', marginBottom: 4 }}>{listing.title || t('host.untitled')}</div>
                <div style={{ fontSize: '0.84rem', color: '#6b7a9a' }}>
                  {listing.vehicle ? `${listing.vehicle.year || ''} ${listing.vehicle.make || ''} ${listing.vehicle.model || ''}`.trim() : ''}
                  {listing.baseDailyRate ? ` · ${fmtMoney(listing.baseDailyRate)}/day` : ''}
                  {listing.instantBook ? ' · Instant Book' : ''}
                </div>
                {listing.description && <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#53607b', maxWidth: 500 }}>{listing.description.slice(0, 120)}{listing.description.length > 120 ? '...' : ''}</p>}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: STATUS_COLORS[listing.status] || 'rgba(136,151,211,.14)' }}>
                  {statusLabel(listing.status)}
                </span>
                <button onClick={() => startEdit(listing)} style={{ background: 'none', border: '1px solid rgba(110,73,255,.2)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#6e49ff', fontWeight: 600, fontSize: '0.82rem' }}>{t('common.edit')}</button>
              </div>
            </div>
          )}
        </section>
      ))}

      {!loading && !listings.length && !error && (
        <div className="surface-note" style={{ textAlign: 'center' }}>
          {t('host.noListings')}
        </div>
      )}
    </div>
  );
}
