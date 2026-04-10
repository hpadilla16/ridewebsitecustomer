'use client';

import { useEffect } from 'react';
import '../lib/i18n';

export function I18nProvider({ children }) {
  useEffect(() => {
    // Sync lang attribute on mount
    try {
      const lang = window.localStorage.getItem('ride_lang') || 'en';
      document.documentElement.lang = lang;
    } catch {}
  }, []);

  return children;
}
