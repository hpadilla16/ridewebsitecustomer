'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './PublicSiteShell.module.css';
import { resolveSiteBasePath, withSiteBase } from '../site/sitePreviewShared';

const navItems = [
  { path: '', label: 'Home' },
  { path: '/rent', label: 'Rent' },
  { path: '/car-sharing', label: 'Car Sharing' },
  { path: '/fleet', label: 'Fleet' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' }
];

export function PublicSiteShell({ children, basePath: forcedBasePath }) {
  const pathname = usePathname();
  const basePath = forcedBasePath || resolveSiteBasePath(pathname);
  const navHrefFor = (path) => withSiteBase(basePath, path);
  const isActive = (path) => {
    const href = navHrefFor(path);
    if (!path) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topline}>
          <span className={styles.toplineBadge}>Puerto Rico, Miami, Orlando, Fort Lauderdale, Los Angeles, Ecuador</span>
          <span className={styles.toplineBadge}>Hosted payments, airport-friendly pickup, and Ride Fleet-powered operations.</span>
        </div>
        <header className={styles.header}>
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
          </div>
          <div className={styles.navRow}>
            <nav className={styles.nav}>
              {navItems.map((item) => (
                <Link
                  key={item.path || 'home'}
                  href={navHrefFor(item.path)}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={withSiteBase(basePath, '/become-a-host')}
                className={`${styles.navLink} ${isActive('/become-a-host') ? styles.navLinkActive : ''}`}
              >
                Become a Host
              </Link>
            </nav>
            <div className={styles.headerAside}>
              <span className={styles.headerAsideLabel}>Ride signature</span>
              <strong>Premium mobility with airport pickup clarity</strong>
            </div>
          </div>
        </header>

        {children}

        <footer className={`${styles.card} ${styles.footer}`}>
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
          </div>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Guest journeys</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/rent')}>Daily Rentals</Link>
                <Link href={withSiteBase(basePath, '/car-sharing')}>Car Sharing</Link>
                <Link href={withSiteBase(basePath, '/checkout')}>Unified Checkout</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Brand support</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/faq')}>FAQ</Link>
                <Link href={withSiteBase(basePath, '/contact')}>Contact</Link>
                <Link href={withSiteBase(basePath, '/become-a-host')}>Become a Host</Link>
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
            <span>Ride Car Sharing beta storefront direction</span>
            <span>Powered by Ride Fleet reservations, hosted payments, and guest portal continuity.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
