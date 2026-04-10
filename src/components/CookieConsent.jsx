'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'ride_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch { setVisible(true); }
  }, []);

  function accept() {
    try { window.localStorage.setItem(COOKIE_KEY, 'accepted'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(30, 40, 71, 0.97)', backdropFilter: 'blur(12px)',
      padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 16, flexWrap: 'wrap',
    }}>
      <p style={{ margin: 0, color: '#e0dff0', fontSize: '0.86rem', lineHeight: 1.5, maxWidth: 600 }}>
        We use cookies to improve your experience, analyze site traffic, and personalize content.
        By continuing to use this site, you agree to our{' '}
        <Link href="/privacy" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Privacy Policy</Link>{' '}
        and{' '}
        <Link href="/terms" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Terms of Service</Link>.
      </p>
      <button
        onClick={accept}
        style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #8752FE, #6d3df2)', color: '#fff',
          fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Accept
      </button>
    </div>
  );
}
