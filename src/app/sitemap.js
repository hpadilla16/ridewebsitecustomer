const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ride-carsharing.com';

export default function sitemap() {
  return [
    // Core pages
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/car-sharing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/fleet`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

    // Host onboarding
    { url: `${SITE_URL}/become-a-host`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },

    // Support
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },

    // Auth & account
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/host-login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/account`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/account/messages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.4 },
    { url: `${SITE_URL}/account/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },

    // Checkout & confirmation
    { url: `${SITE_URL}/checkout`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/confirmation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },

    // Host portal
    { url: `${SITE_URL}/host/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/host/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/host/trips`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/host/earnings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/host/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/host/messages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.4 },
    { url: `${SITE_URL}/host-status`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
  ];
}
