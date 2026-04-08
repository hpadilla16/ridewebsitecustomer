'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, TOKEN_KEY, USER_KEY, readStoredToken, clearStoredAuth } from '@/lib/client';

const STATUS_MAP = {
  PENDING_REVIEW: { label: 'Pending Review', color: '#b45309', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.25)', icon: '⏳' },
  PENDING_INFO: { label: 'Info Requested', color: '#9333ea', bg: 'rgba(147,51,234,.08)', border: 'rgba(147,51,234,.2)', icon: '📋' },
  APPROVED: { label: 'Approved', color: '#15803d', bg: 'rgba(22,128,61,.08)', border: 'rgba(22,128,61,.2)', icon: '✅' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,.08)', border: 'rgba(220,38,38,.2)', icon: '❌' },
};

function statusMeta(status) {
  return STATUS_MAP[String(status || '').toUpperCase()] || STATUS_MAP.PENDING_REVIEW;
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function parseUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid rgba(135,82,254,.18)', background: 'rgba(255,255,255,.7)',
  color: '#1f1f28', fontSize: '0.96rem', outline: 'none', boxSizing: 'border-box',
};
const primaryBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: 48, padding: '0 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #8752FE, #6d3df2)',
  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
  boxShadow: '0 6px 20px rgba(135,82,254,.32)',
};
const ghostBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: 48, padding: '0 20px', borderRadius: 14, cursor: 'pointer',
  border: '1.5px solid rgba(135,82,254,.2)', background: 'transparent',
  color: '#6d3df2', fontWeight: 700, fontSize: '0.93rem', textDecoration: 'none',
};

export default function HostStatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [noAuth, setNoAuth] = useState(false);

  useEffect(() => {
    const storedUser = parseUser();
    setUser(storedUser);

    const token = readStoredToken();
    if (!token) {
      setNoAuth(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await api('/api/public/booking/host-status', { bypassCache: true });
        if (cancelled) return;
        setData(result);
      } catch (err) {
        if (!cancelled) {
          if (err?.status === 401) {
            setNoAuth(true);
          } else {
            setError(err?.message || 'Unable to load your submission status.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    setNoAuth(true);
    setData(null);
    setUser(null);
  };

  const hostName = data?.hostProfile?.displayName || user?.fullName || user?.name || '';
  const submissions = data?.submissions || [];

  // ── Not signed in ──
  if (noAuth) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '80px 20px', textAlign: 'center', display: 'grid', gap: 24 }}>
        <div style={{ fontSize: '2.6rem' }}>🔒</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, letterSpacing: '-.02em', color: '#1a1230', margin: 0 }}>
          Sign in to view your status
        </h1>
        <p style={{ color: '#6f668f', lineHeight: 1.7, margin: 0 }}>
          Log in with the email and password you used during your host application to track your vehicle submission.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/host-login" style={{ ...primaryBtn, textDecoration: 'none' }}>Host Sign In</Link>
          <Link href="/become-a-host" style={{ ...ghostBtn }}>Apply to become a host</Link>
        </div>
      </main>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: '#6f668f', fontWeight: 600 }}>Loading your submission status...</p>
      </main>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px', display: 'grid', gap: 20 }}>
        <div style={{
          padding: '16px 20px', borderRadius: 16,
          background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.2)',
          color: '#991b1b', fontWeight: 600, fontSize: '0.93rem',
        }}>
          {error}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => window.location.reload()} style={primaryBtn}>Retry</button>
          <Link href="/host-login" style={{ ...ghostBtn }}>Sign in again</Link>
        </div>
      </main>
    );
  }

  // ── Dashboard ──
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(28px,5vw,52px) clamp(16px,4vw,24px) 60px', display: 'grid', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'rgba(135,82,254,.08)', border: '1px solid rgba(135,82,254,.18)', color: '#6d3df2', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Host Dashboard
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, letterSpacing: '-.02em', color: '#1a1230', margin: 0 }}>
            {hostName ? `Welcome back, ${hostName}` : 'Your submissions'}
          </h1>
          <p style={{ color: '#6f668f', marginTop: 6, lineHeight: 1.6 }}>
            Track the status of your vehicle submissions and next steps.
          </p>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6f668f', fontWeight: 700, fontSize: '0.88rem', padding: '8px 0' }}>
          Sign out
        </button>
      </div>

      {/* No submissions */}
      {!submissions.length && (
        <div className="glass card-lg" style={{ textAlign: 'center', padding: '48px 32px', display: 'grid', gap: 16 }}>
          <div style={{ fontSize: '2.4rem' }}>📦</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>No submissions yet</h2>
          <p style={{ color: '#6f668f', margin: 0, lineHeight: 1.65 }}>
            You haven&apos;t submitted a vehicle for review yet. Start your host application and list your first car.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link href="/become-a-host" style={{ ...primaryBtn, textDecoration: 'none' }}>List your car</Link>
          </div>
        </div>
      )}

      {/* Submission cards */}
      {submissions.map((sub) => {
        const meta = statusMeta(sub.status);
        const vehicle = [sub.year, sub.make, sub.model].filter(Boolean).join(' ') || 'Vehicle';
        const hasComms = Array.isArray(sub.communications) && sub.communications.length > 0;
        return (
          <div key={sub.id} className="glass card-lg" style={{ display: 'grid', gap: 20, padding: 'clamp(20px, 4vw, 32px)' }}>

            {/* Status + vehicle header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1230', margin: '0 0 6px' }}>{vehicle}</h2>
                {sub.color && <span style={{ fontSize: '0.88rem', color: '#6f668f' }}>{sub.color}</span>}
                {sub.plate && <span style={{ fontSize: '0.88rem', color: '#6f668f', marginLeft: 12 }}>Plate: {sub.plate}</span>}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: meta.bg, border: `1px solid ${meta.border}`,
                color: meta.color, fontSize: '0.84rem', fontWeight: 800, whiteSpace: 'nowrap',
              }}>
                <span>{meta.icon}</span> {meta.label}
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {sub.vehicleType?.name && (
                <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(135,82,254,.04)', border: '1px solid rgba(135,82,254,.1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Type</div>
                  <div style={{ fontWeight: 700, color: '#1a1230', fontSize: '0.92rem' }}>{sub.vehicleType.name}</div>
                </div>
              )}
              {sub.baseDailyRate > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(135,82,254,.04)', border: '1px solid rgba(135,82,254,.1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Daily Rate</div>
                  <div style={{ fontWeight: 700, color: '#1a1230', fontSize: '0.92rem' }}>${Number(sub.baseDailyRate).toFixed(2)}</div>
                </div>
              )}
              {sub.preferredLocation && (
                <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(135,82,254,.04)', border: '1px solid rgba(135,82,254,.1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Hub</div>
                  <div style={{ fontWeight: 700, color: '#1a1230', fontSize: '0.92rem' }}>{sub.preferredLocation.name}</div>
                </div>
              )}
              {sub.createdAt && (
                <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(135,82,254,.04)', border: '1px solid rgba(135,82,254,.1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6f668f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Submitted</div>
                  <div style={{ fontWeight: 700, color: '#1a1230', fontSize: '0.92rem' }}>{formatDate(sub.createdAt)}</div>
                </div>
              )}
            </div>

            {/* Status explanation */}
            {sub.status === 'PENDING_REVIEW' && (
              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.18)', fontSize: '0.88rem', color: '#92400e', lineHeight: 1.65 }}>
                Your submission is in queue for review. Our team typically reviews new vehicles within <strong>48 hours</strong>. You&apos;ll receive an email when your vehicle is approved or if we need more info.
              </div>
            )}
            {sub.status === 'PENDING_INFO' && (
              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(147,51,234,.06)', border: '1px solid rgba(147,51,234,.18)', fontSize: '0.88rem', color: '#6b21a8', lineHeight: 1.65 }}>
                Our review team needs additional information before approving your vehicle. Check your email at <strong>{data?.hostProfile?.email || 'your registered address'}</strong> for a reply link.
                {sub.reviewNotes && (
                  <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(147,51,234,.05)', border: '1px solid rgba(147,51,234,.12)' }}>
                    <div style={{ fontWeight: 800, marginBottom: 4, fontSize: '0.84rem' }}>Review note:</div>
                    {sub.reviewNotes}
                  </div>
                )}
              </div>
            )}
            {sub.status === 'APPROVED' && (
              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(22,128,61,.06)', border: '1px solid rgba(22,128,61,.18)', fontSize: '0.88rem', color: '#166534', lineHeight: 1.65 }}>
                Your vehicle is approved and live! Manage your listing, pricing, and availability from the Host App.
                <div style={{ marginTop: 12 }}>
                  <a
                    href="https://ridefleetmanager.com/host"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...primaryBtn, display: 'inline-flex', height: 42, padding: '0 22px', fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    Open Host App →
                  </a>
                </div>
              </div>
            )}
            {sub.status === 'REJECTED' && (
              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.18)', fontSize: '0.88rem', color: '#991b1b', lineHeight: 1.65 }}>
                This submission was not approved.
                {sub.reviewNotes && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Reason:</strong> {sub.reviewNotes}
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <Link href="/become-a-host" style={{ color: '#6d3df2', fontWeight: 700, textDecoration: 'none' }}>Submit a new application →</Link>
                </div>
              </div>
            )}

            {/* Communications timeline */}
            {hasComms && (
              <div style={{ borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 16, display: 'grid', gap: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Communication history</h3>
                {sub.communications.map((comm, i) => (
                  <div key={comm.id || i} style={{
                    padding: '12px 16px', borderRadius: 14,
                    background: comm.direction === 'INBOUND' ? 'rgba(135,82,254,.04)' : 'rgba(255,255,255,.8)',
                    border: '1px solid rgba(135,82,254,.1)',
                    fontSize: '0.88rem', color: '#433b63', lineHeight: 1.6,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                        {comm.direction === 'INBOUND' ? 'Your reply' : 'Review team'}
                      </span>
                      {comm.createdAt && (
                        <span style={{ fontSize: '0.78rem', color: '#9990b0' }}>{formatDate(comm.createdAt)}</span>
                      )}
                    </div>
                    {comm.subject && <div style={{ fontWeight: 700, marginBottom: 4 }}>{comm.subject}</div>}
                    {comm.message && <div>{comm.message}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
        <a
          href="https://ridefleetmanager.com/host"
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...ghostBtn }}
        >
          Open Host App ↗
        </a>
        <Link href="/become-a-host" style={{ ...ghostBtn }}>Submit another vehicle</Link>
        <Link href="/contact" style={{ ...ghostBtn }}>Contact support</Link>
      </div>

    </main>
  );
}
