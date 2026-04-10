'use client';

import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://beta.ride-carsharing.com';

/**
 * Breadcrumb component with JSON-LD schema.
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 */
export function Breadcrumbs({ items }) {
  if (!items?.length) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {})
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Breadcrumb" style={{ fontSize: '0.82rem', color: '#6b7a9a', marginBottom: 12 }}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {idx > 0 && <span style={{ color: '#d1d5db' }}>/</span>}
              {item.href && idx < items.length - 1 ? (
                <Link href={item.href} style={{ color: '#6e49ff', textDecoration: 'none', fontWeight: 600 }}>{item.label}</Link>
              ) : (
                <span style={{ color: '#1e2847', fontWeight: idx === items.length - 1 ? 600 : 400 }}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
