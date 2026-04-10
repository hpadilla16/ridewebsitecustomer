'use client';

import { useEffect } from 'react';
import '../lib/i18n';

export function I18nProvider({ children }) {
  useEffect(() => {
    try {
      const lang = window.localStorage.getItem('ride_lang') || 'en';
      document.documentElement.lang = lang;
    } catch {}
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return children;
}
