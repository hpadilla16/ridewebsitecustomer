const SEARCHES_KEY = 'ride_saved_searches';

export function getSavedSearches() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(SEARCHES_KEY) || '[]'); } catch { return []; }
}

export function saveSearch(search) {
  const searches = getSavedSearches();
  const entry = {
    id: `${search.mode}-${search.locationId}-${search.pickupAt}`,
    mode: search.mode || 'RENTAL',
    locationLabel: search.locationLabel || '',
    locationId: search.locationId || '',
    pickupAt: search.pickupAt || '',
    returnAt: search.returnAt || '',
    savedAt: new Date().toISOString()
  };
  // Dedupe by id
  const filtered = searches.filter((s) => s.id !== entry.id);
  filtered.unshift(entry);
  try { window.localStorage.setItem(SEARCHES_KEY, JSON.stringify(filtered.slice(0, 10))); } catch {}
  return filtered.slice(0, 10);
}

export function removeSavedSearch(id) {
  const searches = getSavedSearches().filter((s) => s.id !== id);
  try { window.localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches)); } catch {}
  return searches;
}

export function clearSavedSearches() {
  try { window.localStorage.removeItem(SEARCHES_KEY); } catch {}
}
