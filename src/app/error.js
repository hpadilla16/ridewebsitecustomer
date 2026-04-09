'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[RideFleet] Unhandled error:', error);
  }, [error]);

  return (
    <section style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#211a38' }}>Something went wrong</h1>
      <p style={{ color: '#6f668f', lineHeight: 1.6, marginBottom: 24 }}>
        We hit an unexpected error. Please try again or contact support if it keeps happening.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '12px 28px',
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #8752FE, #6d3df2)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </section>
  );
}
