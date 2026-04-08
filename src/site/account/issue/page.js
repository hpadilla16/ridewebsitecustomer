'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/client';
import styles from '../../sitePreviewPremium.module.css';

const INCIDENT_TYPES = [
  { value: 'DAMAGE', label: 'Vehicle Damage' },
  { value: 'BILLING', label: 'Billing or Charges' },
  { value: 'SERVICE', label: 'Service Issue' },
  { value: 'SAFETY', label: 'Safety Concern' },
  { value: 'OTHER', label: 'Other' },
];

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
  const searchParams = useSearchParams();
  const paramReference = searchParams.get('reference') || '';
  const paramEmail = searchParams.get('email') || '';

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
      setError('Please describe the issue before submitting.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address so we can follow up.');
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
      setError(err?.message || 'Unable to submit your report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 580, margin: '0 auto', padding: '48px 24px' }}>
        <section className={`glass card-lg ${styles.detailHero}`}>
          <span className="eyebrow">Issue Reported</span>
          <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
            Your report has been received
          </h1>
          <p className={styles.detailLead}>
            Our support team will review your submission and follow up at the email address you provided.
          </p>
        </section>

        <section className="glass card-lg" style={{ padding: '28px 24px', borderRadius: 18 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="surface-note">
              <strong>Report submitted</strong>
              {ticketId && (
                <div className="ui-muted" style={{ marginTop: 6 }}>
                  Ticket reference: <strong>{ticketId}</strong>
                </div>
              )}
              <div className="ui-muted" style={{ marginTop: 6 }}>
                A confirmation will be sent to <strong>{email}</strong>. Typical response time is 1 business day.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href="/account"
                className={styles.resultPrimaryAction}
                style={{ textDecoration: 'none' }}
              >
                Back to my trips
              </Link>
              <Link
                href="/contact"
                className={styles.resultSecondaryAction}
                style={{ textDecoration: 'none' }}
              >
                Contact support
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
        <span className="eyebrow">Report an Issue</span>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
          {reference ? `Issue with ${reference}` : 'Report an Issue'}
        </h1>
        <p className={styles.detailLead}>
          Tell us what happened and our support team will follow up with you promptly.
        </p>
      </section>

      <section className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-reference" className="label">
              Booking reference
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
              Your email address
            </label>
            <input
              id="issue-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              Issue type
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
              {INCIDENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="issue-description" className="label">
              Description <span style={{ color: 'rgba(255,80,80,0.8)' }}>*</span>
            </label>
            <textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened, including any relevant dates, times, or details that will help us resolve this quickly."
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
              {loading ? 'Submitting...' : 'Submit report'}
            </button>
            <Link
              href="/account"
              className={styles.checkoutGhostButton}
              style={{ textDecoration: 'none', textAlign: 'center', flex: '0 1 auto' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>

      <div className="surface-note" style={{ borderRadius: 14, padding: '14px 18px' }}>
        <span className="ui-muted" style={{ fontSize: '0.88rem' }}>
          For urgent safety concerns, please contact us directly via the{' '}
          <Link href="/contact" style={{ color: 'rgba(15,176,216,0.9)', fontWeight: 600, textDecoration: 'none' }}>
            contact page
          </Link>
          .
        </span>
      </div>
    </div>
  );
}

export default function IssuePageWrapper() {
  return (
    <Suspense fallback={
      <div className="stack" style={{ gap: 24, maxWidth: 580, margin: '0 auto', padding: '64px 24px' }}>
        <div className="glass card-lg" style={{ padding: '32px 28px', borderRadius: 20 }}>
          <span className="eyebrow">Report an Issue</span>
          <p className="ui-muted" style={{ marginTop: 12 }}>Loading form...</p>
        </div>
      </div>
    }>
      <IssueForm />
    </Suspense>
  );
}
