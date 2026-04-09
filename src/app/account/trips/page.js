'use client';
import { Suspense } from 'react';
import TripDetailPage from '../../../site/account/trips/detail';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 700, margin: '64px auto', padding: '0 24px', textAlign: 'center', color: '#6b7a9a' }}>Loading...</div>}>
      <TripDetailPage />
    </Suspense>
  );
}
