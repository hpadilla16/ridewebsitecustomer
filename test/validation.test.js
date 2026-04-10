import { describe, it, expect } from 'vitest';
import { validateGuestInfo } from '../src/lib/validation';

describe('validateGuestInfo', () => {
  const validCustomer = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1 787 555 0100',
  };

  it('passes with valid data', () => {
    const result = validateGuestInfo(validCustomer);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('fails with empty firstName', () => {
    const result = validateGuestInfo({ ...validCustomer, firstName: '' });
    expect(result.success).toBe(false);
    expect(result.errors.firstName).toBeDefined();
  });

  it('fails with empty lastName', () => {
    const result = validateGuestInfo({ ...validCustomer, lastName: '' });
    expect(result.success).toBe(false);
    expect(result.errors.lastName).toBeDefined();
  });

  it('fails with invalid email', () => {
    const result = validateGuestInfo({ ...validCustomer, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('fails with empty email', () => {
    const result = validateGuestInfo({ ...validCustomer, email: '' });
    expect(result.success).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('fails with short phone', () => {
    const result = validateGuestInfo({ ...validCustomer, phone: '123' });
    expect(result.success).toBe(false);
    expect(result.errors.phone).toBeDefined();
  });

  it('accepts optional fields as empty', () => {
    const result = validateGuestInfo({
      ...validCustomer,
      dateOfBirth: '',
      licenseNumber: '',
      licenseState: '',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional fields as undefined', () => {
    const result = validateGuestInfo({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '7875550100',
    });
    expect(result.success).toBe(true);
  });

  it('returns multiple errors at once', () => {
    const result = validateGuestInfo({ firstName: '', lastName: '', email: '', phone: '' });
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });

  it('trims whitespace before validation', () => {
    const result = validateGuestInfo({
      firstName: '  Jane  ',
      lastName: '  Smith  ',
      email: 'jane@example.com',
      phone: '7875550100',
    });
    expect(result.success).toBe(true);
  });

  it('fails with whitespace-only name', () => {
    const result = validateGuestInfo({ ...validCustomer, firstName: '   ' });
    expect(result.success).toBe(false);
    expect(result.errors.firstName).toBeDefined();
  });
});
