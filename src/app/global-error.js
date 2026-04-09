'use client';

export default function RootError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f6ff' }}>
        <section style={{ maxWidth: 600, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#211a38' }}>Something went wrong</h1>
          <p style={{ color: '#6f668f', lineHeight: 1.6, marginBottom: 24 }}>
            We hit an unexpected error loading the page. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 28px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #8752FE, #6d3df2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </section>
      </body>
    </html>
  );
}
