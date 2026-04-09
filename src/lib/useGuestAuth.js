'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './client';

function readStorage(key) {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function readJson(key) {
  const raw = readStorage(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function useGuestAuth() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = readStorage('ride_guest_token');
    const c = readJson('ride_guest_customer');
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);
    setCustomer(c);
    setReady(true);
  }, [router]);

  return { token, customer, ready };
}

export async function guestApi(path, opts = {}) {
  return api(`/api/public/booking/messages${path}`, opts);
}
