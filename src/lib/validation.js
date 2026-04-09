import { z } from 'zod';

export const guestInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits'),
  dateOfBirth: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().max(4).optional(),
});

/**
 * Validate guest info and return { success, errors }.
 * errors is a Map<fieldName, errorMessage>.
 */
export function validateGuestInfo(customer) {
  const result = guestInfoSchema.safeParse(customer);
  if (result.success) return { success: true, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}
