'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/client';
import { fmtMoney, listingVehicleLabel, publicLocationLabel, resolveSiteBasePath, vehicleTypeLabel, withSiteBase } from '../sitePreviewShared';

export default function FleetPreviewPage() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const [bootstrap, setBootstrap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const payload = await api('/api/public/booking/bootstrap');
        setBootstrap(payload);
      } catch (err) {
        setError(String(err?.message || t('fleetPage.unableToLoad')));
      }
    })();
  }, []);

  const locations = Array.isArray(bootstrap?.locations) ? bootstrap.locations : [];
  const vehicleTypes = Array.isArray(bootstrap?.vehicleTypes) ? bootstrap.vehicleTypes : [];
  const featuredListings = Array.isArray(bootstrap?.featuredCarSharingListings) ? bootstrap.featuredCarSharingListings : [];

  const groupedVehicleTypes = useMemo(() => {
    return vehicleTypes.reduce((acc, vehicleType) => {
      const key = String(vehicleType?.tenantId || 'default');
      if (!acc[key]) acc[key] = [];
      acc[key].push(vehicleType);
      return acc;
    }, {});
  }, [vehicleTypes]);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">{t('fleetPage.eyebrow')}</span>
        <h1 style={{ marginTop: 8 }}>{t('fleetPage.heading')}</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          {t('fleetPage.intro')}
        </p>
        {error ? <div className="label" style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <article className="glass card" style={{ padding: 22 }}>
          <div className="label">{t('fleetPage.locationsLabel')}</div>
          <h3 style={{ marginTop: 8 }}>{t('fleetPage.publicPickupHubs')}</h3>
          <div className="stack" style={{ gap: 10 }}>
            {locations.length ? locations.slice(0, 6).map((location) => (
              <div key={location.id} className="surface-note">
                <strong>{location.name}</strong>
                <div className="ui-muted">{publicLocationLabel(location)}</div>
              </div>
            )) : <div className="ui-muted">{t('fleetPage.noLocations')}</div>}
          </div>
        </article>

        <article className="glass card" style={{ padding: 22 }}>
          <div className="label">{t('fleetPage.rentalClassesLabel')}</div>
          <h3 style={{ marginTop: 8 }}>{t('fleetPage.vehicleTypesAvailable')}</h3>
          <div className="stack" style={{ gap: 10 }}>
            {Object.values(groupedVehicleTypes).flat().slice(0, 8).map((vehicleType) => (
              <div key={vehicleType.id} className="surface-note">
                <strong>{vehicleTypeLabel(vehicleType)}</strong>
                <div className="ui-muted">{vehicleType.code || t('fleetPage.rentalClass')}</div>
              </div>
            ))}
            {!vehicleTypes.length ? <div className="ui-muted">{t('fleetPage.noRentalClasses')}</div> : null}
          </div>
        </article>

        <article className="glass card" style={{ padding: 22 }}>
          <div className="label">{t('common.carSharing')}</div>
          <h3 style={{ marginTop: 8 }}>{t('fleetPage.featuredGuestListings')}</h3>
          <div className="stack" style={{ gap: 10 }}>
            {featuredListings.length ? featuredListings.slice(0, 6).map((listing) => (
              <div key={listing.id} className="surface-note">
                <strong>{listing.title || listingVehicleLabel(listing)}</strong>
                <div className="ui-muted">
                  {publicLocationLabel(listing.location)}
                  {Number(listing.baseDailyRate || 0) ? ` | ${t('fleetPage.fromPerDay', { price: fmtMoney(listing.baseDailyRate) })}` : ''}
                </div>
              </div>
            )) : <div className="ui-muted">{t('fleetPage.noFeaturedListings')}</div>}
          </div>
        </article>
      </section>

      <section className="glass card-lg" style={{ padding: 24 }}>
        <div className="row-between" style={{ alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <span className="eyebrow">{t('fleetPage.websiteDirection')}</span>
            <h2 style={{ margin: 0 }}>{t('fleetPage.exploreOurFleet')}</h2>
            <p className="ui-muted" style={{ margin: 0 }}>
              {t('fleetPage.exploreDesc')}
            </p>
          </div>
          <div className="inline-actions">
            <Link href={withSiteBase(basePath, '/rent')} className="ios-action-btn" style={{ textDecoration: 'none' }}>{t('fleetPage.openRentalLane')}</Link>
            <Link href={withSiteBase(basePath, '/car-sharing')} className="button-subtle" style={{ textDecoration: 'none' }}>{t('fleetPage.openCarSharingLane')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
