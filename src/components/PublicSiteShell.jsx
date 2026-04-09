'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PublicSiteShell.module.css';
import { resolveSiteBasePath, withSiteBase } from '../site/sitePreviewShared';
import { siteConfig } from '../site/siteConfig';

function useIsHostLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try { setLoggedIn(!!window.localStorage.getItem('fleet_jwt')); } catch { setLoggedIn(false); }
  }, []);
  return loggedIn;
}

const navItems = [
  { path: '', label: 'Home' },
  { path: '/rent', label: 'Rent' },
  { path: '/car-sharing', label: 'Car Sharing' },
  { path: '/fleet', label: 'Fleet' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
  { path: '/become-a-host', label: 'Become a Host' }
];

export function PublicSiteShell({ children, basePath: forcedBasePath }) {
  const pathname = usePathname();
  const basePath = forcedBasePath || resolveSiteBasePath(pathname);
  const isHost = useIsHostLoggedIn();
  const year = new Date().getFullYear();
  const navHrefFor = (path) => withSiteBase(basePath, path);
  const isActive = (path) => {
    const href = navHrefFor(path);
    if (!path) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <div className={styles.shell}>
        <div className={styles.topline} aria-label="Service coverage and booking assurances">
          <span className={styles.toplineBadge}>Puerto Rico, Miami, Orlando, Fort Lauderdale, Los Angeles, Ecuador</span>
          <span className={styles.toplineBadge}>Hosted payments, airport-friendly pickup, and Ride Fleet-powered operations.</span>
        </div>
        <header className={styles.header} role="banner">
          <div className={styles.headerRow}>
            <Link href={withSiteBase(basePath)} className={styles.brand}>
              <span className={styles.brandMark}>
                <Image
                  src="/brand/ride-symbol.png"
                  alt="Ride symbol"
                  width={34}
                  height={34}
                  className={styles.brandMarkImage}
                />
              </span>
              <span className={styles.brandText}>
                <span className={styles.eyebrow}>Ride Car Sharing</span>
                <span className={styles.name}>Airport-ready rentals and car sharing</span>
                <span className={styles.tagline}>Travel-grade booking experience powered by real Ride Fleet operations.</span>
              </span>
            </Link>
            <Link href={withSiteBase(basePath, '/rent')} className={styles.navButton}>
              Start Booking
            </Link>
            <div className={styles.headerAuthLinks}>
              <Link
                href={withSiteBase(basePath, '/login')}
                className={`${styles.navLink} ${isActive('/login') ? styles.navLinkActive : ''}`}
                aria-current={isActive('/login') ? 'page' : undefined}
              >
                Sign In
              </Link>
              {isHost ? (
                <Link
                  href="/host/dashboard"
                  className={`${styles.navLink} ${pathname.startsWith('/host/') ? styles.navLinkActive : ''}`}
                  aria-current={pathname.startsWith('/host/') ? 'page' : undefined}
                >
                  Host Dashboard
                </Link>
              ) : (
                <Link
                  href={withSiteBase(basePath, '/host-login')}
                  className={`${styles.navLink} ${isActive('/host-login') ? styles.navLinkActive : ''}`}
                  aria-current={isActive('/host-login') ? 'page' : undefined}
                >
                  Host Login
                </Link>
              )}
            </div>
          </div>
          <div className={styles.navRow}>
            <nav className={styles.nav} aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.path || 'home'}
                  href={navHrefFor(item.path)}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className={styles.headerAside}>
              <span className={styles.headerAsideLabel}>Ride signature</span>
              <strong>Premium mobility with airport pickup clarity</strong>
            </div>
          </div>
        </header>

        <main id="main-content" className={styles.mainContent}>
          {children}
        </main>

        <footer className={`${styles.card} ${styles.footer}`} aria-label="Site footer">
          <div className={styles.footerBrand}>
            <Image
              src="/brand/ride-logo-white-horizontal.png"
              alt="Ride Car Sharing"
              width={170}
              height={55}
              className={styles.footerLogo}
            />
            <span className={styles.footerEyebrow}>Ride Car Sharing</span>
            <h3 className={styles.footerTitle}>Airport-ready rentals, curated car sharing, and a calmer digital handoff.</h3>
            <p className={styles.footerLead}>
              A more premium storefront powered by real Ride Fleet operations, hosted payments, and a cleaner path from search to pickup.
            </p>
            <div className={styles.footerTrustRow}>
              <span className={styles.footerTrustBadge}>Hosted payments</span>
              <span className={styles.footerTrustBadge}>Airport-first pickup</span>
              <span className={styles.footerTrustBadge}>Ride Fleet-backed operations</span>
            </div>
          </div>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Guest journeys</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/rent')}>Daily Rentals</Link>
                <Link href={withSiteBase(basePath, '/car-sharing')}>Car Sharing</Link>
                <Link href={withSiteBase(basePath, '/checkout')}>Checkout</Link>
                <Link href={withSiteBase(basePath, '/account')}>My Trips</Link>
                <Link href={withSiteBase(basePath, '/login')}>Guest Sign In</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Brand support</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/faq')}>FAQ</Link>
                <Link href={withSiteBase(basePath, '/contact')}>Contact</Link>
                <Link href={withSiteBase(basePath, '/become-a-host')}>Become a Host</Link>
                <Link href={withSiteBase(basePath, '/host-login')}>Host Login</Link>
                <Link href={withSiteBase(basePath, '/host-status')}>Submission Status</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Trust and policy</span>
              <div className={styles.footerLinks}>
                <Link href="/privacy">Privacy</Link>
                <Link href={withSiteBase(basePath, '/checkout')}>Checkout</Link>
                <Link href={withSiteBase(basePath, '/fleet')}>Fleet</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>{siteConfig.name} © {year}</span>
            <span>Powered by Ride Fleet reservations, hosted payments, and guest portal continuity.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
