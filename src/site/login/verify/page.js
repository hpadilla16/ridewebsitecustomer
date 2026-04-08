'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import styles from '../../sitePreviewPremium.module.css';

export default function VerifyPage({ params }) {
  const router = useRouter();
  const token = params?.token;
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMessage('No sign-in token found in this link. Please request a new sign-in link.');
      setStatus('error');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const data = await api(`/api/public/booking/guest-signin/${encodeURIComponent(token)}`);
        if (cancelled) return;

        const customer = data?.customer;
        if (!customer?.id) {
          throw new Error('The sign-in link is invalid or has already been used.');
        }

        try {
          window.localStorage.setItem('ride_guest_token', token);
          window.localStorage.setItem('ride_guest_customer', JSON.stringify({
            id: customer.id,
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email || '',
          }));
        } catch {
          // Storage unavailable — proceed anyway; account page will handle it
        }

        setStatus('success');
        router.replace('/account');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err?.message || 'This sign-in link is invalid or has expired. Please request a new one.'
        );
        setStatus('error');
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 520, margin: '0 auto', padding: '64px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">Signing in</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
            Verifying your link...
          </h1>
          <p className={styles.detailLead}>
            Hold on while we confirm your identity. This only takes a moment.
          </p>
        </section>
        <div className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid rgba(15, 176, 216, 0.7)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            <span className="ui-muted">Verifying sign-in token with Ride...</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 520, margin: '0 auto', padding: '64px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">Signed in</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
            Welcome back
          </h1>
          <p className={styles.detailLead}>
            You are signed in. Redirecting you to your trips now...
          </p>
        </section>
      </div>
    );
  }

  // error state
  return (
    <div className="stack" style={{ gap: 24, maxWidth: 520, margin: '0 auto', padding: '64px 24px' }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <span className="eyebrow">Sign-in failed</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
          This link did not work
        </h1>
        <p className={styles.detailLead}>
          Sign-in links are single-use and expire after 15 minutes. Please request a fresh one.
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
        <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', marginBottom: 18 }}>
          <strong style={{ color: '#ff6b6b' }}>Unable to sign in</strong>
          <div className="ui-muted" style={{ marginTop: 6 }}>{errorMessage}</div>
        </div>
        <a
          href="/login"
          className={styles.checkoutPrimaryButton}
          style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
        >
          Request a new sign-in link
        </a>
      </section>
    </div>
  );
}
