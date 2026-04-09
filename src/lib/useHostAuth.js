'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, TOKEN_KEY, USER_KEY } from './client';

function readStorage(key) {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function readJson(key) {
  const raw = readStorage(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function useHostAuth() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = readStorage(TOKEN_KEY);
    const u = readJson(USER_KEY);
    if (!t) {
      router.replace('/host-login');
      return;
    }
    setToken(t);
    setUser(u);
    setReady(true);
  }, [router]);

  function logout() {
    try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
    try { window.localStorage.removeItem(USER_KEY); } catch {}
    router.replace('/host-login');
  }

  return { token, user, ready, logout };
}

export async function hostApi(path, opts = {}, token) {
  return api(`/api/host-app${path}`, opts, token);
}
