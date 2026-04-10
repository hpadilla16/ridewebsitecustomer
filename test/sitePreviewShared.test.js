import { describe, it, expect } from 'vitest';
import {
  fmtMoney,
  addDays,
  publicLocationLabel,
  buildPublicLocationOptions,
  findPublicLocationOption,
  backendLocationIdsForPublicOption,
  vehicleTypeLabel,
  listingVehicleLabel,
  normalizeImageList,
  rentalResultImageList,
  searchParamsToString,
  buildUnifiedCheckoutQuery,
  resolveSiteBasePath,
  withSiteBase,
  locationById,
} from '../src/site/sitePreviewShared';

describe('fmtMoney', () => {
  it('formats zero', () => {
    expect(fmtMoney(0)).toBe('$0.00');
  });
  it('formats a positive number', () => {
    expect(fmtMoney(49.99)).toBe('$49.99');
  });
  it('formats a large number with commas', () => {
    expect(fmtMoney(1234.5)).toBe('$1,234.50');
  });
  it('handles null/undefined', () => {
    expect(fmtMoney(null)).toBe('$0.00');
    expect(fmtMoney(undefined)).toBe('$0.00');
  });
  it('handles string input', () => {
    expect(fmtMoney('25.50')).toBe('$25.50');
  });
});

describe('addDays', () => {
  it('adds days correctly', () => {
    const base = new Date(2026, 3, 1); // April 1 local
    const result = addDays(base, 3);
    expect(result.getDate()).toBe(4);
  });
  it('handles negative days', () => {
    const base = new Date(2026, 3, 10); // April 10 local
    const result = addDays(base, -2);
    expect(result.getDate()).toBe(8);
  });
});

describe('publicLocationLabel', () => {
  it('joins name, city, state with pipes', () => {
    expect(publicLocationLabel({ name: 'SJU Airport', city: 'San Juan', state: 'PR' }))
      .toBe('SJU Airport | San Juan | PR');
  });
  it('omits missing fields', () => {
    expect(publicLocationLabel({ name: 'Downtown', city: 'Miami' }))
      .toBe('Downtown | Miami');
  });
  it('returns fallback for null', () => {
    expect(publicLocationLabel(null)).toBe('Location');
  });
  it('returns fallback for empty object', () => {
    expect(publicLocationLabel({})).toBe('Location');
  });
});

describe('buildPublicLocationOptions', () => {
  it('groups locations by label', () => {
    const locations = [
      { id: '1', name: 'SJU', city: 'San Juan', state: 'PR', tenantId: 't1' },
      { id: '2', name: 'SJU', city: 'San Juan', state: 'PR', tenantId: 't2' },
      { id: '3', name: 'MIA', city: 'Miami', state: 'FL', tenantId: 't1' },
    ];
    const result = buildPublicLocationOptions(locations);
    expect(result).toHaveLength(2);
    const sju = result.find((r) => r.label.includes('SJU'));
    expect(sju.locationIds).toEqual(['1', '2']);
    expect(sju.tenantIds).toEqual(['t1', 't2']);
  });
  it('handles empty array', () => {
    expect(buildPublicLocationOptions([])).toEqual([]);
  });
  it('handles non-array input', () => {
    expect(buildPublicLocationOptions(null)).toEqual([]);
  });
});

describe('findPublicLocationOption', () => {
  const options = [
    { id: 'SJU | San Juan | PR', locationIds: ['1', '2'], locations: [] },
    { id: 'MIA | Miami | FL', locationIds: ['3'], locations: [] },
  ];
  it('finds by option id', () => {
    expect(findPublicLocationOption(options, 'MIA | Miami | FL')?.locationIds).toEqual(['3']);
  });
  it('finds by backend location id', () => {
    expect(findPublicLocationOption(options, '2')?.id).toBe('SJU | San Juan | PR');
  });
  it('returns null for no match', () => {
    expect(findPublicLocationOption(options, 'nonexistent')).toBeNull();
  });
});

describe('backendLocationIdsForPublicOption', () => {
  const options = [{ id: 'SJU', locationIds: ['a', 'b'] }];
  it('returns locationIds for match', () => {
    expect(backendLocationIdsForPublicOption(options, 'SJU')).toEqual(['a', 'b']);
  });
  it('returns empty for no match', () => {
    expect(backendLocationIdsForPublicOption(options, 'MIA')).toEqual([]);
  });
});

describe('vehicleTypeLabel', () => {
  it('returns name', () => {
    expect(vehicleTypeLabel({ name: 'Compact', code: 'COMPACT' })).toBe('Compact');
  });
  it('falls back to code', () => {
    expect(vehicleTypeLabel({ code: 'SUV' })).toBe('SUV');
  });
  it('returns default', () => {
    expect(vehicleTypeLabel(null)).toBe('Vehicle class');
  });
});

describe('listingVehicleLabel', () => {
  it('joins year make model', () => {
    expect(listingVehicleLabel({ vehicle: { year: 2023, make: 'Tesla', model: 'Model 3' } }))
      .toBe('2023 Tesla Model 3');
  });
  it('falls back to title', () => {
    expect(listingVehicleLabel({ title: 'Premium Sedan' })).toBe('Premium Sedan');
  });
  it('returns default', () => {
    expect(listingVehicleLabel({})).toBe('Vehicle');
  });
});

describe('normalizeImageList', () => {
  it('returns array of trimmed strings', () => {
    expect(normalizeImageList(['  a.jpg ', 'b.jpg'])).toEqual(['a.jpg', 'b.jpg']);
  });
  it('filters empty strings', () => {
    expect(normalizeImageList(['a.jpg', '', null])).toEqual(['a.jpg']);
  });
  it('limits to 6 images', () => {
    const input = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
    expect(normalizeImageList(input)).toHaveLength(6);
  });
  it('wraps single string in array', () => {
    expect(normalizeImageList('single.jpg')).toEqual(['single.jpg']);
  });
  it('handles null', () => {
    expect(normalizeImageList(null)).toEqual([]);
  });
});

describe('rentalResultImageList', () => {
  it('merges image sources and dedupes', () => {
    const result = rentalResultImageList({
      imageUrls: ['a.jpg'],
      primaryImageUrl: 'b.jpg',
      vehicleType: { imageUrls: ['c.jpg'], primaryImageUrl: 'd.jpg' }
    });
    expect(result).toContain('a.jpg');
    expect(result).toContain('b.jpg');
    expect(result).toContain('c.jpg');
    expect(result.length).toBeLessThanOrEqual(6);
  });
});

describe('searchParamsToString', () => {
  it('builds query string', () => {
    expect(searchParamsToString({ a: '1', b: '2' })).toBe('a=1&b=2');
  });
  it('skips null/undefined/empty', () => {
    expect(searchParamsToString({ a: '1', b: null, c: '', d: undefined })).toBe('a=1');
  });
  it('handles empty object', () => {
    expect(searchParamsToString({})).toBe('');
  });
});

describe('buildUnifiedCheckoutQuery', () => {
  it('normalizes CAR_SHARING mode', () => {
    const result = buildUnifiedCheckoutQuery({ searchMode: 'car_sharing', listingId: '123' });
    expect(result).toContain('searchMode=CAR_SHARING');
    expect(result).toContain('listingId=123');
  });
  it('removes searchMode for rentals', () => {
    const result = buildUnifiedCheckoutQuery({ searchMode: 'rental', vehicleTypeId: '456' });
    expect(result).not.toContain('searchMode');
    expect(result).toContain('vehicleTypeId=456');
  });
});

describe('resolveSiteBasePath', () => {
  it('returns /beta for beta paths', () => {
    expect(resolveSiteBasePath('/beta/rent')).toBe('/beta');
  });
  it('returns empty for normal paths', () => {
    expect(resolveSiteBasePath('/rent')).toBe('');
  });
  it('handles empty', () => {
    expect(resolveSiteBasePath('')).toBe('');
  });
});

describe('withSiteBase', () => {
  it('prefixes beta path', () => {
    expect(withSiteBase('/beta', '/rent')).toBe('/beta/rent');
  });
  it('returns path without base', () => {
    expect(withSiteBase('', '/rent')).toBe('/rent');
  });
  it('returns base for root', () => {
    expect(withSiteBase('/beta', '/')).toBe('/beta');
    expect(withSiteBase('', '/')).toBe('/');
  });
});

describe('locationById', () => {
  const locations = [
    { id: '1', name: 'SJU' },
    { id: '2', name: 'MIA' },
  ];
  it('finds by id', () => {
    expect(locationById(locations, '2')?.name).toBe('MIA');
  });
  it('returns null for no match', () => {
    expect(locationById(locations, '99')).toBeNull();
  });
  it('handles empty array', () => {
    expect(locationById([], '1')).toBeNull();
  });
});
