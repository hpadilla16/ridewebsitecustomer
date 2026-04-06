'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildUnifiedCheckoutQuery, formatPublicDateTime } from '../sitePreviewShared';

function UnifiedCheckoutPreviewContent() {
  const searchParams = useSearchParams();
  const searchMode = String(searchParams.get('searchMode') || '').toUpperCase() === 'CAR_SHARING' ? 'CAR_SHARING' : 'RENTAL';
  const pickupLocationId = String(searchParams.get('pickupLocationId') || searchParams.get('locationId') || '');
  const returnLocationId = String(searchParams.get('returnLocationId') || pickupLocationId);
  const pickupAt = String(searchParams.get('pickupAt') || '');
  const returnAt = String(searchParams.get('returnAt') || '');
  const vehicleTypeId = String(searchParams.get('vehicleTypeId') || '');
  const listingId = String(searchParams.get('listingId') || '');

  const checkoutQuery = useMemo(() => buildUnifiedCheckoutQuery({
    searchMode,
    pickupLocationId,
    returnLocationId,
    pickupAt,
    returnAt,
    vehicleTypeId,
    listingId
  }), [listingId, pickupAt, pickupLocationId, returnAt, returnLocationId, searchMode, vehicleTypeId]);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Unified Checkout</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>One guest checkout, regardless of lane</h1>
        <p className="ui-muted" style={{ maxWidth: 760 }}>
          The public site will let guests browse rentals and car sharing differently, but once they commit, both journeys land in the same Ride Fleet booking flow.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 18 }}>
        <div className="glass card" style={{ padding: 24 }}>
          <span className="eyebrow">Guest Summary</span>
          <h2 style={{ margin: '8px 0 18px' }}>{searchMode === 'CAR_SHARING' ? 'Car sharing checkout' : 'Rental checkout'}</h2>
          <div className="stack" style={{ gap: 12 }}>
            <div className="surface-note">
              <strong>Pickup</strong>
              <div className="ui-muted">{formatPublicDateTime(pickupAt)}</div>
            </div>
            <div className="surface-note">
              <strong>Return</strong>
              <div className="ui-muted">{formatPublicDateTime(returnAt)}</div>
            </div>
            <div className="surface-note">
              <strong>Lane</strong>
              <div className="ui-muted">{searchMode === 'CAR_SHARING' ? 'Marketplace-style host vehicle booking' : 'Traditional rental booking'}</div>
            </div>
            <div className="surface-note">
              <strong>Selection</strong>
              <div className="ui-muted">
                {searchMode === 'CAR_SHARING'
                  ? (listingId ? `Listing ${listingId}` : 'A listing will be chosen before checkout.')
                  : (vehicleTypeId ? `Vehicle type ${vehicleTypeId}` : 'A rental class will be chosen before checkout.')}
              </div>
            </div>
          </div>
        </div>

        <div className="glass card" style={{ padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
          <span className="eyebrow">Flow Definition</span>
          <div className="surface-note">
            <strong>1. Discovery</strong>
            <div className="ui-muted">Guests browse rentals or car sharing in distinct storefront experiences.</div>
          </div>
          <div className="surface-note">
            <strong>2. Detail</strong>
            <div className="ui-muted">A polished detail page clarifies pricing, pickup, and what makes the listing fit the trip.</div>
          </div>
          <div className="surface-note">
            <strong>3. Unified checkout</strong>
            <div className="ui-muted">Ride Fleet's public booking flow handles guest details, services, insurance, and reservation creation.</div>
          </div>
          <Link href={`/?${checkoutQuery}`} className="ios-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Return to storefront
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function UnifiedCheckoutPreviewPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading checkout...</div>}>
      <UnifiedCheckoutPreviewContent />
    </Suspense>
  );
}
