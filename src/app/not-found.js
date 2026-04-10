import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', fontWeight: 900, color: '#8752FE', marginBottom: 8 }}>404</div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e2847', marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: '#6b7a9a', lineHeight: 1.6, marginBottom: 28 }}>
        The page you are looking for does not exist or has been moved. Let us help you find what you need.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/rent"
          style={{
            padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
            background: 'linear-gradient(135deg, #8752FE, #6d3df2)', color: '#fff',
            fontWeight: 700, fontSize: '0.9rem'
          }}
        >
          Browse Rentals
        </Link>
        <Link
          href="/car-sharing"
          style={{
            padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
            border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff',
            fontWeight: 700, fontSize: '0.9rem'
          }}
        >
          Car Sharing
        </Link>
        <Link
          href="/"
          style={{
            padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
            border: '1px solid rgba(110,73,255,.2)', color: '#6e49ff',
            fontWeight: 700, fontSize: '0.9rem'
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
