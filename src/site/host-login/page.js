'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, TOKEN_KEY, USER_KEY } from '@/lib/client';
import styles from '../sitePreviewPremium.module.css';

export default function HostLoginPage() {
  const { t } = useTranslation();
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
      try { if (token) localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
      try { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* storage unavailable */ }
      const name =
        user?.name ||
        user?.fullName ||
        user?.displayName ||
        user?.email ||
        email;
      setSignedInUser({ ...user, _resolvedName: name });
    } catch (err) {
      setError(err.message || t('hostLogin.signInFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="legal-shell">
      <section className="glass card-lg legal-hero">
        <span className="eyebrow">{t('hostLogin.hostAccess')}</span>
        <h1 className="legal-title">{t('hostLogin.title')}</h1>
        <p className="legal-lead">
          {t('hostLogin.subtitle')}
        </p>
        <div className="hero-meta">
          <span className="hero-pill">{t('hostLogin.pillAppAccess')}</span>
          <span className="hero-pill">{t('hostLogin.pillListingMgmt')}</span>
          <span className="hero-pill">{t('hostLogin.pillFleetOps')}</span>
        </div>
        <div className="inline-actions">
          <Link href="/become-a-host" className="legal-link-pill">{t('common.becomeAHost')}</Link>
          <Link href="/contact" className="legal-link-pill">{t('hostLogin.contactSupport')}</Link>
        </div>
      </section>

      <section className="legal-layout">
        <aside className="glass card legal-nav">
          <div className="label">{t('hostLogin.hostResources')}</div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="surface-note">
              {t('hostLogin.resourceManage')}
            </div>
            <div className="surface-note">
              {t('hostLogin.resourceSignIn')}
            </div>
            <div className="surface-note">
              {t('hostLogin.notAHostYet')}{' '}
              <Link href="/become-a-host" style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}>
                {t('hostLogin.applyToBeHost')}
              </Link>{' '}
              {t('hostLogin.andSubmitVehicle')}
            </div>
            <div className="surface-note">
              {t('hostLogin.lookingToBook')}{' '}
              <Link href="/login" style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}>
                {t('hostLogin.guestSignInHere')}
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
                  {t('hostLogin.signedIn')}
                </div>

                <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em', color: '#1f2340' }}>
                  {t('hostLogin.signedInAs', { name: signedInUser._resolvedName })}
                </h2>
                <p style={{ margin: 0, color: '#4f5a77', lineHeight: 1.72, fontSize: '1rem' }}>
                  {t('hostLogin.openHostAppManage')}
                </p>

                <div className="inline-actions" style={{ marginTop: 4 }}>
                  <Link
                    href="/host-status"
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
                    {t('hostLogin.viewSubmissionStatus')}
                  </Link>
                  <a
                    href="https://ridefleetmanager.com/host"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-subtle"
                    style={{ textDecoration: 'none' }}
                  >
                    {t('hostLogin.openHostApp')}
                  </a>
                </div>

                <div
                  className="surface-note"
                  style={{ marginTop: 4, fontSize: '0.88rem', color: '#66708d' }}
                >
                  {t('hostLogin.hostAppNewTab')}
                </div>
              </div>
            </section>
          ) : (
            <section className="glass card-lg legal-section">
              <h2>{t('hostLogin.signInToAccount')}</h2>
              <p style={{ margin: '0 0 20px', color: '#4f5a77', lineHeight: 1.72 }}>
                {t('hostLogin.enterCredentials')}
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
                  <span className="label">{t('hostLogin.emailAddress')}</span>
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
                  <span className="label">{t('hostLogin.password')}</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('hostLogin.yourPassword')}
                    required
                    autoComplete="current-password"
                    style={{ fontSize: '1rem' }}
                  />
                </label>

                <div className="inline-actions" style={{ marginTop: 4 }}>
                  <button type="submit" disabled={submitting}>
                    {submitting ? t('hostLogin.signingIn') : t('hostLogin.signInButton')}
                  </button>
                  <Link
                    href="/become-a-host"
                    className="button-subtle"
                    style={{ textDecoration: 'none' }}
                  >
                    {t('hostLogin.createAccount')}
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
                    {t('hostLogin.notAHost')}{' '}
                    <Link
                      href="/login"
                      style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {t('hostLogin.guestSignIn')}
                    </Link>
                  </span>
                  <span style={{ color: 'rgba(102,112,141,0.4)' }}>|</span>
                  <span>
                    {t('hostLogin.newToRide')}{' '}
                    <Link
                      href="/become-a-host"
                      style={{ color: '#4530c8', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {t('hostLogin.applyToBeHost')}
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
