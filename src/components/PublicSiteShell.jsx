'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import styles from './PublicSiteShell.module.css';
import { resolveSiteBasePath, withSiteBase } from '../site/sitePreviewShared';
import { siteConfig } from '../site/siteConfig';
import { setLanguage } from '../lib/i18n';

function useIsHostLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try { setLoggedIn(!!window.localStorage.getItem('fleet_jwt')); } catch { setLoggedIn(false); }
  }, []);
  return loggedIn;
}

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  return (
    <button
      onClick={() => setLanguage(isEs ? 'en' : 'es')}
      aria-label={isEs ? 'Switch to English' : 'Cambiar a Español'}
      style={{
        background: 'none', border: '1px solid rgba(135,82,254,.18)', borderRadius: 8,
        padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
        color: '#6e49ff', letterSpacing: '.03em'
      }}
    >
      {isEs ? 'EN' : 'ES'}
    </button>
  );
}

export function PublicSiteShell({ children, basePath: forcedBasePath }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const basePath = forcedBasePath || resolveSiteBasePath(pathname);
  const isHost = useIsHostLoggedIn();
  const [mobileOpen, setMobileOpen] = useState(false);
const navHrefFor = (path) => withSiteBase(basePath, path);
  const isActive = (path) => {
    const href = navHrefFor(path);
    if (!path) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    { path: '', label: t('common.home') },
    { path: '/rent', label: t('common.rent') },
    { path: '/car-sharing', label: t('common.carSharing') },
    { path: '/fleet', label: t('common.fleet') },
    { path: '/faq', label: t('common.faq') },
    { path: '/contact', label: t('common.contact') },
    { path: '/about', label: 'About' },
    { path: '/become-a-host', label: t('common.becomeAHost') }
  ];

  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <div className={styles.shell}>
        <div className={styles.topline} aria-label="Service coverage and booking assurances">
          <span className={styles.toplineBadge}>{t('shell.toplineCities')}</span>
          <span className={styles.toplineBadge}>{t('shell.toplineOps')}</span>
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
                <span className={styles.name}>{t('shell.brandTagline')}</span>
                <span className={styles.tagline}>{t('shell.brandLead')}</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              style={{
                display: 'none', background: 'none', border: '1px solid rgba(135,82,254,.2)',
                borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6e49ff', fontSize: '1.2rem', lineHeight: 1,
              }}
              className={styles.mobileMenuBtn}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
            <div className={styles.headerActions}>
              <LanguageToggle />
              <div className={styles.headerAuthLinks}>
                <Link
                  href={withSiteBase(basePath, '/login')}
                  className={`${styles.navLink} ${isActive('/login') ? styles.navLinkActive : ''}`}
                  aria-current={isActive('/login') ? 'page' : undefined}
                >
                  {t('common.signIn')}
                </Link>
                {isHost ? (
                  <Link
                    href="/host/dashboard"
                    className={`${styles.navLink} ${pathname.startsWith('/host/') ? styles.navLinkActive : ''}`}
                    aria-current={pathname.startsWith('/host/') ? 'page' : undefined}
                  >
                    {t('common.hostDashboard')}
                  </Link>
                ) : (
                  <Link
                    href={withSiteBase(basePath, '/host-login')}
                    className={`${styles.navLink} ${isActive('/host-login') ? styles.navLinkActive : ''}`}
                    aria-current={isActive('/host-login') ? 'page' : undefined}
                  >
                    {t('common.hostLogin')}
                  </Link>
                )}
              </div>
              <Link href={withSiteBase(basePath, '/rent')} className={styles.navButton} style={{ fontSize: '0.86rem', padding: '9px 18px' }}>
                {t('common.startBooking')}
              </Link>
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
              <span className={styles.headerAsideLabel}>{t('shell.rideSignature')}</span>
              <strong>{t('shell.premiumMobility')}</strong>
            </div>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className={styles.mobileDrawer}>
            <nav style={{ display: 'grid', gap: 4, padding: '12px 0' }}>
              {navItems.map((item) => (
                <Link
                  key={item.path || 'home'}
                  href={navHrefFor(item.path)}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block', padding: '12px 20px', borderRadius: 10, textDecoration: 'none',
                    fontWeight: 600, fontSize: '0.92rem',
                    color: isActive(item.path) ? '#6e49ff' : '#1e2847',
                    background: isActive(item.path) ? 'rgba(110,73,255,.06)' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid rgba(135,82,254,.08)', margin: '8px 0' }} />
              <Link href={withSiteBase(basePath, '/login')} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', color: '#6e49ff' }}>
                {t('common.signIn')}
              </Link>
              {isHost ? (
                <Link href="/host/dashboard" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', color: '#6e49ff' }}>
                  {t('common.hostDashboard')}
                </Link>
              ) : (
                <Link href={withSiteBase(basePath, '/host-login')} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', color: '#1e2847' }}>
                  {t('common.hostLogin')}
                </Link>
              )}
            </nav>
          </div>
        )}

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
              style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(20%) saturate(1800%) hue-rotate(200deg)' }}
            />
            <span className={styles.footerEyebrow}>Ride Car Sharing</span>
            <h3 className={styles.footerTitle}>{t('shell.footerTitle')}</h3>
            <p className={styles.footerLead}>{t('shell.footerLead')}</p>
            <div className={styles.footerTrustRow}>
              <span className={styles.footerTrustBadge}>{t('shell.hostedPayments')}</span>
              <span className={styles.footerTrustBadge}>{t('shell.airportPickup')}</span>
              <span className={styles.footerTrustBadge}>{t('shell.rideFleetOps')}</span>
            </div>
          </div>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>{t('shell.guestJourneys')}</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/rent')}>{t('shell.dailyRentals')}</Link>
                <Link href={withSiteBase(basePath, '/car-sharing')}>{t('common.carSharing')}</Link>
                <Link href={withSiteBase(basePath, '/checkout')}>{t('shell.checkout')}</Link>
                <Link href={withSiteBase(basePath, '/account')}>{t('shell.myTrips')}</Link>
                <Link href={withSiteBase(basePath, '/login')}>{t('shell.guestSignIn')}</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>{t('shell.brandSupport')}</span>
              <div className={styles.footerLinks}>
                <Link href={withSiteBase(basePath, '/faq')}>{t('common.faq')}</Link>
                <Link href={withSiteBase(basePath, '/contact')}>{t('common.contact')}</Link>
                <Link href={withSiteBase(basePath, '/become-a-host')}>{t('common.becomeAHost')}</Link>
                <Link href={withSiteBase(basePath, '/host-login')}>{t('common.hostLogin')}</Link>
                <Link href={withSiteBase(basePath, '/host-status')}>{t('shell.submissionStatus')}</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>{t('shell.trustPolicy')}</span>
              <div className={styles.footerLinks}>
                <Link href="/privacy">{t('shell.privacy')}</Link>
                <Link href="/terms">Terms of Service</Link>
                <Link href={withSiteBase(basePath, '/fleet')}>{t('common.fleet')}</Link>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnLabel}>Contact</span>
              <div className={styles.footerLinks}>
                <a href="mailto:customerservice@ridecarsharing.com">customerservice@ridecarsharing.com</a>
                <a href="tel:+18006765764">1 (800) 676-5764</a>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>San Juan, Puerto Rico</span>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>{siteConfig.name} © 2025</span>
            <span>{t('shell.poweredBy')}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
