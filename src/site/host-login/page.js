'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, TOKEN_KEY, USER_KEY } from '@/lib/client';
import styles from '../sitePreviewPremium.module.css';

export default function HostLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [signedInUser, setSignedInUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const token = result?.token || result?.jwt || result?.accessToken || '';
      const user = result?.user || result?.host || result || null;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      const name =
        user?.name ||
        user?.fullName ||
        user?.displayName ||
        user?.email ||
        email;
      setSignedInUser({ ...user, _resolvedName: name });
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="legal-shell">
      <section className="glass card-lg legal-hero">
        <span className="eyebrow">Host Access</span>
        <h1 className="legal-title">Host Sign In</h1>
        <p className="legal-lead">
          Sign in to your Ride Fleet host account. Once signed in, open the Host App to manage your
          listings, review incoming trip requests, and handle your fleet from one place.
        </p>
        <div className="hero-meta">
          <span className="hero-pill">Host App access</span>
          <span className="hero-pill">Listing management</span>
          <span className="hero-pill">Ride Fleet-powered operations</span>
        </div>
        <div className="inline-actions">
          <Link href="/become-a-host" className="legal-link-pill">Become a Host</Link>
          <Link href="/contact" className="legal-link-pill">Contact Support</Link>
        </div>
      </section>

      <section className="legal-layout">
        <aside className="glass card legal-nav">
          <div className="label">Host Resources</div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="surface-note">
              The Host App is where you manage your active listings, review incoming reservations, update pricing, and communicate with guests.
            </div>
            <div className="surface-note">
              Sign in here to get your session started, then follow the link to open the Host App in a new tab.
            </div>
            <div className="surface-note">
              Not a host yet?{' '}
              <Link href="/become-a-host" style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}>
                Apply to become a host
              </Link>{' '}
              and submit your vehicle for review.
            </div>
            <div className="surface-note">
              Looking to book a car as a guest?{' '}
              <Link href="/login" style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}>
                Guest sign-in is here
              </Link>.
            </div>
          </div>
        </aside>

        <div className="legal-content">
          {signedInUser ? (
            <section className="glass card-lg legal-section">
              <div
                style={{
                  display: 'grid',
                  gap: 18,
                  padding: '8px 0'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: 'rgba(22, 101, 52, 0.08)',
                    border: '1px solid rgba(22, 101, 52, 0.2)',
                    color: '#166534',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    width: 'fit-content'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#16a34a',
                      flexShrink: 0
                    }}
                  />
                  Signed in
                </div>

                <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em', color: '#1f2340' }}>
                  You're signed in as {signedInUser._resolvedName}.
                </h2>
                <p style={{ margin: 0, color: '#4f5a77', lineHeight: 1.72, fontSize: '1rem' }}>
                  Open the Host App to manage your listings and trips.
                </p>

                <div className="inline-actions" style={{ marginTop: 4 }}>
                  <a
                    href="https://ridefleetmanager.com/host"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '14px 22px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, #6e49ff, #8f74ff)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.96rem',
                      textDecoration: 'none',
                      border: 'none',
                      boxShadow: '0 16px 28px rgba(110, 73, 255, 0.25)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    Open Host App
                    <span aria-hidden="true" style={{ fontSize: '1rem' }}>↗</span>
                  </a>
                  <Link
                    href="/rent"
                    className="button-subtle"
                    style={{ textDecoration: 'none' }}
                  >
                    Browse rentals
                  </Link>
                </div>

                <div
                  className="surface-note"
                  style={{ marginTop: 4, fontSize: '0.88rem', color: '#66708d' }}
                >
                  The Host App opens in a new tab. Your session is active in this browser.
                </div>
              </div>
            </section>
          ) : (
            <section className="glass card-lg legal-section">
              <h2>Sign in to your host account</h2>
              <p style={{ margin: '0 0 20px', color: '#4f5a77', lineHeight: 1.72 }}>
                Enter the email address and password you used when creating your host account.
              </p>

              {error ? (
                <div
                  className="surface-note"
                  style={{
                    color: '#991b1b',
                    background: 'rgba(153, 27, 27, 0.06)',
                    border: '1px solid rgba(153, 27, 27, 0.18)',
                    marginBottom: 18
                  }}
                >
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="stack" style={{ gap: 16 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span className="label">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={{ fontSize: '1rem' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span className="label">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    style={{ fontSize: '1rem' }}
                  />
                </label>

                <div className="inline-actions" style={{ marginTop: 4 }}>
                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Sign In to Host Account'}
                  </button>
                  <Link
                    href="/become-a-host"
                    className="button-subtle"
                    style={{ textDecoration: 'none' }}
                  >
                    Create host account
                  </Link>
                </div>

                <div
                  className="surface-note"
                  style={{
                    marginTop: 8,
                    fontSize: '0.88rem',
                    color: '#66708d',
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <span>
                    Not a host?{' '}
                    <Link
                      href="/login"
                      style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Guest sign-in
                    </Link>
                  </span>
                  <span style={{ color: 'rgba(102,112,141,0.4)' }}>|</span>
                  <span>
                    New to Ride?{' '}
                    <Link
                      href="/become-a-host"
                      style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Apply to become a host
                    </Link>
                  </span>
                </div>
              </form>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
