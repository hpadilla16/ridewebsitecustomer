const defaultSiteUrl = 'https://beta.ride-carsharing.com';

export const siteConfig = {
  name: 'Ride Car Sharing',
  shortName: 'Ride',
  title: 'Ride Car Sharing | Airport-Ready Rentals And Car Sharing',
  description:
    'Airport-ready rentals, curated car sharing, and a premium digital handoff powered by real Ride Fleet operations.',
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  ogImage: '/brand/ride-banner-facebook-cover.jpg',
  keywords: [
    'car rental puerto rico',
    'airport car rental',
    'car sharing',
    'ride car sharing',
    'san juan airport rental',
    'premium mobility',
    'rentals and car sharing'
  ]
};

export function absoluteSiteUrl(path = '/') {
  const normalizedPath = String(path || '/').startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}
