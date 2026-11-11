import { describe, expect, it } from 'vitest';

import { signupSchema } from '@/lib/auth/schemas';
import { validateForm } from '@/lib/utils/form-validation';

describe('Form Integration', () => {
    it('validates signup form data correctly', () => {
        const formData = {
            confirmPassword: 'Password123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'Password123',
            username: 'testuser'
        };

        const result = validateForm(signupSchema, formData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(formData);
    });

    it('returns validation errors for invalid data', () => {
        const formData = {
            confirmPassword: 'different',
            email: 'invalid-email',
            password: 'weak',
            username: 'a'
        };

        const result = validateForm(signupSchema, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors?.email).toBe('Invalid email address');
    });
});
