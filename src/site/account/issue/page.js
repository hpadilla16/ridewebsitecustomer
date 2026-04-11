'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import styles from '../../sitePreviewPremium.module.css';

function readGuestEmail() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem('ride_guest_customer');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.email || '';
  } catch {
    return '';
  }
}

function IssueForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const paramReference = searchParams.get('reference') || '';
  const paramEmail = searchParams.get('email') || '';

  const INCIDENT_TYPES = [
    { value: 'DAMAGE', label: t('issue.vehicleDamage') },
    { value: 'BILLING', label: t('issue.billingCharges') },
    { value: 'SERVICE', label: t('issue.serviceIssue') },
    { value: 'SAFETY', label: t('issue.safetyConcern') },
    { value: 'OTHER', label: t('issue.other') },
  ];

  const [reference, setReference] = useState(paramReference);
  const [email, setEmail] = useState(paramEmail);
  const [incidentType, setIncidentType] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  // Fill email from localStorage if not in params
  useEffect(() => {
    if (!paramEmail) {
      const stored = readGuestEmail();
      if (stored) setEmail(stored);
    }
  }, [paramEmail]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError(t('issue.describeFirst'));
      return;
    }
    if (!email.trim()) {
      setError(t('issue.enterEmail'));
      return;
    }

    setLoading(true);
    try {
      const result = await api('/api/public/booking/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim(),
          email: email.trim(),
          description: description.trim(),
          incidentType,
        }),
      });
      setTicketId(result?.id || result?.ticketId || '');
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || t('issue.submitError'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 580, margin: '0 auto', padding: '48px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">{t('issue.issueReported')}</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
            {t('issue.reportReceived')}
          </h1>
          <p className={styles.detailLead}>
            {t('issue.supportFollowUp')}
          </p>
        </section>

        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="surface-note">
              <strong>{t('issue.reportSubmitted')}</strong>
              {ticketId && (
                <div className="ui-muted" style={{ marginTop: 6 }}>
                  {t('issue.ticketReference')}: <strong>{ticketId}</strong>
                </div>
              )}
              <div className="ui-muted" style={{ marginTop: 6 }}>
                {t('issue.confirmationSent', { email })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href="/account"
                className={styles.resultPrimaryAction}
                style={{ textDecoration: 'none' }}
              >
                {t('issue.backToTrips')}
              </Link>
              <Link
                href="/contact"
                className={styles.resultSecondaryAction}
                style={{ textDecoration: 'none' }}
              >
                {t('issue.contactSupport')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 580, margin: '0 auto', padding: '48px 24px' }}>
      <section className={`glass card-lg ${styles.detailHero}`}>
        <span className="eyebrow">{t('issue.title')}</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
          {reference ? t('issue.issueWith', { reference }) : t('issue.title')}
        </h1>
        <p className={styles.detailLead}>
          {t('issue.tellUsWhatHappened')}
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-reference" className="label">
              {t('issue.reference')}
            </label>
            <input
              id="issue-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TRP-123456"
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
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-email" className="label">
              {t('issue.emailAddress')}
            </label>
            <input
              id="issue-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('issue.emailPlaceholder')}
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
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-type" className="label">
              {t('issue.issueType')}
            </label>
            <select
              id="issue-type"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(136, 151, 211, 0.28)',
                background: 'rgba(24, 19, 60, 0.95)',
                color: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              {INCIDENT_TYPES.map((it) => (
                <option key={it.value} value={it.value}>
                  {it.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-description" className="label">
              {t('issue.issueDescription')} <span style={{ color: 'rgba(255,80,80,0.8)' }}>*</span>
            </label>
            <textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('issue.descriptionPlaceholder')}
              required
              rows={5}
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
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: 1.7,
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.3)', background: 'rgba(255,60,60,0.08)' }}>
              <strong style={{ color: '#ff6b6b' }}>{error}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              className={styles.checkoutPrimaryButton}
              style={{
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                border: 'none',
                flex: '1 1 auto',
                minWidth: 160,
              }}
            >
              {loading ? t('common.submitting') : t('issue.submitReport')}
            </button>
            <Link
              href="/account"
              className={styles.checkoutGhostButton}
              style={{ textDecoration: 'none', textAlign: 'center', flex: '0 1 auto' }}
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </section>

      <div className="surface-note" style={{ borderRadius: 14, padding: '14px 18px' }}>
        <span className="ui-muted" style={{ fontSize: '0.88rem' }}>
          {t('issue.urgentSafety')}{' '}
          <Link href="/contact" style={{ color: 'rgba(15,176,216,0.9)', fontWeight: 600, textDecoration: 'none' }}>
            {t('issue.contactPage')}
          </Link>
          .
        </span>
      </div>
    </div>
  );
}

export default function IssuePageWrapper() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="stack" style={{ gap: 24, maxWidth: 580, margin: '0 auto', padding: '64px 24px' }}>
        <div className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <span className="eyebrow">{t('issue.title')}</span>
          <p className="ui-muted" style={{ marginTop: 12 }}>{t('issue.loadingForm')}</p>
        </div>
      </div>
    }>
      <IssueForm />
    </Suspense>
  );
}
