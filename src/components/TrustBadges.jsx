'use client';

export function TrustBadges({ compact = false }) {
  const badges = [
    { icon: '🔒', label: 'Secure Payments' },
    { icon: '🛡', label: 'Trip Protection' },
    { icon: '✓', label: 'Verified Hosts' },
    { icon: '📱', label: 'Digital Handoff' },
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {badges.map((b) => (
          <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#6b7a9a', fontWeight: 600 }}>
            {b.icon} {b.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
      {badges.map((b) => (
        <div key={b.label} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 10,
          border: '1px solid rgba(135,82,254,.1)', background: 'rgba(135,82,254,.03)',
          fontSize: '0.84rem', fontWeight: 600, color: '#1e2847'
        }}>
          <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
          {b.label}
        </div>
      ))}
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 6,
      background: 'rgba(22,163,74,.1)', color: '#047857',
      fontSize: '0.72rem', fontWeight: 700
    }}>
      ✓ Verified
    </span>
  );
}
