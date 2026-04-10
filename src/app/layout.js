import '../app/globals.css';
import { PublicSiteShell } from '../components/PublicSiteShell';
import { I18nProvider } from '../components/I18nProvider';
import { CookieConsent } from '../components/CookieConsent';
import { Analytics } from '../components/Analytics';
import { siteConfig } from '../site/siteConfig';

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'travel',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'es': '/',
    }
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} premium storefront`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/brand/ride-symbol.png',
    apple: '/brand/ride-symbol.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1117' }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <I18nProvider>
          <Analytics />
          <PublicSiteShell>{children}</PublicSiteShell>
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
