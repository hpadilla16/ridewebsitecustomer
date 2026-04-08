'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import styles from '../sitePreviewPremium.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await api('/api/public/booking/guest-signin/request', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <span className="eyebrow">Guest Account</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
          Sign in to Ride
        </h1>
        <p className={styles.detailLead} style={{ maxWidth: 480 }}>
          We use a secure, password-free sign-in link. Enter your email and we will send you a link to access your trips instantly.
        </p>
      </section>

      {sent ? (
        <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(15, 176, 216, 0.14)',
              border: '1px solid rgba(15, 176, 216, 0.28)',
              fontSize: '1.5rem',
            }}>
              ✉
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Check your email</h2>
              <p className="ui-muted" style={{ margin: 0, lineHeight: 1.7 }}>
                We sent a sign-in link to <strong>{email}</strong>. Click the link in that email to access your trips — no password needed.
              </p>
            </div>
            <div className="surface-note" style={{ marginTop: 4 }}>
              <strong>Link expires in 15 minutes.</strong>
              <div className="ui-muted" style={{ marginTop: 4 }}>
                If you do not see the email, check your spam folder. The link works only once and expires shortly after it is sent.
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(''); }}
              className={styles.checkoutGhostButton}
              style={{ textAlign: 'center', cursor: 'pointer', border: 'none', marginTop: 4 }}
            >
              Use a different email
            </button>
          </div>
        </section>
      ) : (
        <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="guest-email" className="label">
                Email address
              </label>
              <input
                id="guest-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(136, 151, 211, 0.28)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'inherit',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {error && (
              <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.3)', background: 'rgba(255,60,60,0.08)' }}>
                <strong style={{ color: '#ff6b6b' }}>{error}</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.checkoutPrimaryButton}
              style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none' }}
            >
              {loading ? 'Sending link...' : 'Send sign-in link'}
            </button>
          </form>
        </section>
      )}

      <div className="surface-note" style={{ borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="ui-muted" style={{ fontSize: '0.88rem' }}>
            Are you a fleet host or operator?
          </span>
          <Link
            href="/host-login"
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'rgba(15, 176, 216, 0.9)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Host login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
