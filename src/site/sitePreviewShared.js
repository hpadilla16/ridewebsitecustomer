import { api } from '../lib/client';

export function publicCarSharingTenantSlug() {
  return String(process.env.NEXT_PUBLIC_CAR_SHARING_TENANT_SLUG || '').trim().toLowerCase();
}

export function fmtMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

export function toLocalInputValue(dateLike) {
  const value = new Date(dateLike);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function addDays(base, days) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function publicLocationLabel(location) {
  return [location?.name, location?.city, location?.state].filter(Boolean).join(' | ') || 'Location';
}

export function buildPublicLocationOptions(locations = []) {
  const groups = new Map();
  (Array.isArray(locations) ? locations : []).forEach((location) => {
    const key = publicLocationLabel(location);
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: key,
        locationIds: [],
        tenantIds: [],
        locations: []
      });
    }
    const group = groups.get(key);
    group.locationIds.push(location.id);
    if (location?.tenantId && !group.tenantIds.includes(location.tenantId)) {
      group.tenantIds.push(location.tenantId);
    }
    group.locations.push(location);
  });
  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function findPublicLocationOption(locationOptions = [], id = '') {
  return (Array.isArray(locationOptions) ? locationOptions : []).find((location) => (
    String(location.id) === String(id)
    || (Array.isArray(location.locationIds) && location.locationIds.some((locationId) => String(locationId) === String(id)))
  )) || null;
}

export function backendLocationIdsForPublicOption(locationOptions = [], id = '') {
  return findPublicLocationOption(locationOptions, id)?.locationIds || [];
}

export function backendLocationIdForPublicOption(locationOptions = [], id = '') {
  return backendLocationIdsForPublicOption(locationOptions, id)[0] || '';
}

export function normalizePublicLocationSelectionId(locationOptions = [], id = '') {
  return findPublicLocationOption(locationOptions, id)?.id || '';
}

export function vehicleTypeLabel(vehicleType) {
  return vehicleType?.name || vehicleType?.code || 'Vehicle class';
}

export function listingVehicleLabel(listing) {
  return [
    listing?.vehicle?.year,
    listing?.vehicle?.make,
    listing?.vehicle?.model
  ].filter(Boolean).join(' ') || listing?.title || 'Vehicle';
}

export function normalizeImageList(value) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 6);
}

export function rentalResultImageList(result) {
  return normalizeImageList([
    ...(Array.isArray(result?.imageUrls) ? result.imageUrls : []),
    result?.primaryImageUrl,
    result?.imageUrl,
    ...(Array.isArray(result?.vehicleType?.imageUrls) ? result.vehicleType.imageUrls : []),
    result?.vehicleType?.primaryImageUrl,
    result?.vehicleType?.imageUrl
  ]);
}

export function searchParamsToString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    query.set(key, String(value));
  });
  return query.toString();
}

export function formatPublicDateTime(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function locationById(locations = [], id = '') {
  return (Array.isArray(locations) ? locations : []).find((location) => String(location.id) === String(id)) || null;
}

export function buildUnifiedCheckoutQuery(params = {}) {
  const next = { ...params };
  if (String(next.searchMode || '').toUpperCase() === 'CAR_SHARING') {
    next.searchMode = 'CAR_SHARING';
  } else {
    delete next.searchMode;
  }
  return searchParamsToString(next);
}

export function resolveSiteBasePath(pathname = '') {
  return String(pathname || '').startsWith('/beta') ? '/beta' : '';
}

export function withSiteBase(basePath, path = '') {
  if (!path || path === '/') return basePath || '/';
  const normalizedPath = String(path).startsWith('/') ? path : `/${path}`;
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
}

export function fetchBookingBootstrap(options = {}) {
  const tenantSlug = String(options?.tenantSlug || '').trim();
  const query = tenantSlug ? `?${searchParamsToString({ tenantSlug })}` : '';
  return api(`/api/public/booking/bootstrap${query}`, { cacheTtlMs: 60000 });
}
