const FAVORITES_KEY = 'ride_favorites';

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch { return []; }
}

export function isFavorite(listingId) {
  return getFavorites().some((f) => f.id === listingId);
}

export function toggleFavorite(listing) {
  const favorites = getFavorites();
  const idx = favorites.findIndex((f) => f.id === listing.id);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push({
      id: listing.id,
      title: listing.title || '',
      baseDailyRate: listing.baseDailyRate || 0,
      primaryImageUrl: listing.primaryImageUrl || listing.imageUrls?.[0] || '',
      vehicleLabel: [listing.vehicle?.year, listing.vehicle?.make, listing.vehicle?.model].filter(Boolean).join(' ') || '',
      savedAt: new Date().toISOString()
    });
  }
  try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 50))); } catch {}
  return !!(idx < 0);
}
