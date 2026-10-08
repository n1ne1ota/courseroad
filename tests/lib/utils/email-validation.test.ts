import { describe, expect, it } from 'vitest';

import {
    extractEmailDomain,
    isCorporateEmail,
    isDisposableEmail,
    isValidEmailFormat,
    isValidEmailStrict,
    normalizeEmail,
    suggestEmailCorrection,
    validateEmail,
    validateEmailDetailed,
    validateEmailField,
    validateEmailWithOptions
} from '@/lib/utils/email-validation';

describe('Email Validation', () => {
    describe('isValidEmailFormat', () => {
        it('accepts a standard email address', () => {
            expect(isValidEmailFormat('user@example.com')).toBe(true);
        });

        it('accepts an email with a plus alias', () => {
            expect(isValidEmailFormat('user+tag@example.com')).toBe(true);
        });

        it('rejects an empty string', () => {
            expect(isValidEmailFormat('')).toBe(false);
        });

        it('rejects an email missing the @ symbol', () => {
            expect(isValidEmailFormat('userexample.com')).toBe(false);
        });

        it('rejects an email missing the domain', () => {
            expect(isValidEmailFormat('user@')).toBe(false);
        });

        it('trims and lowercases before validating', () => {
            expect(isValidEmailFormat('  User@Example.COM  ')).toBe(true);
        });
    });

    describe('isValidEmailStrict', () => {
        it('accepts a standard email', () => {
            expect(isValidEmailStrict('user@example.com')).toBe(true);
        });

        it('accepts plus-addressed emails', () => {
            expect(isValidEmailStrict('user+newsletter@gmail.com')).toBe(true);
        });

        it('rejects an empty string', () => {
            expect(isValidEmailStrict('')).toBe(false);
        });

        it('rejects emails with spaces in the local part', () => {
            expect(isValidEmailStrict('us er@example.com')).toBe(false);
        });
    });

    describe('extractEmailDomain', () => {
        it('extracts the domain from a valid email', () => {
            expect(extractEmailDomain('user@example.com')).toBe('example.com');
        });

        it('lowercases the domain', () => {
            expect(extractEmailDomain('user@Example.COM')).toBe('example.com');
        });

        it('returns null for an invalid email', () => {
            expect(extractEmailDomain('not-an-email')).toBeNull();
        });

        it('returns null for an empty string', () => {
            expect(extractEmailDomain('')).toBeNull();
        });
    });

    describe('isDisposableEmail', () => {
        it('detects a known disposable domain', () => {
            expect(isDisposableEmail('test@mailinator.com')).toBe(true);
        });

        it('detects yopmail as disposable', () => {
            expect(isDisposableEmail('test@yopmail.com')).toBe(true);
        });

        it('returns false for a real domain', () => {
            expect(isDisposableEmail('user@gmail.com')).toBe(false);
        });

        it('returns false for an invalid email', () => {
            expect(isDisposableEmail('not-email')).toBe(false);
        });
    });

    describe('isCorporateEmail', () => {
        it('detects a known corporate domain', () => {
            expect(isCorporateEmail('alice@company.com')).toBe(true);
        });

        it('returns false for a personal domain', () => {
            expect(isCorporateEmail('bob@gmail.com')).toBe(false);
        });
    });

    describe('suggestEmailCorrection', () => {
        it('suggests gmail.com for gmail.co', () => {
            expect(suggestEmailCorrection('user@gmail.co')).toBe('user@gmail.com');
        });

        it('suggests hotmail.com for hotmai.com', () => {
            expect(suggestEmailCorrection('user@hotmai.com')).toBe('user@hotmail.com');
        });

        it('suggests outlook.com for outlok.com', () => {
            expect(suggestEmailCorrection('user@outlok.com')).toBe('user@outlook.com');
        });

        it('returns null for a correct domain', () => {
            expect(suggestEmailCorrection('user@gmail.com')).toBeNull();
        });

        it('returns null for an invalid email', () => {
            expect(suggestEmailCorrection('invalid')).toBeNull();
        });
    });

    describe('validateEmailDetailed', () => {
        it('returns valid result for a standard email', () => {
            const result = validateEmailDetailed('user@gmail.com');

            expect(result.isValid).toBe(true);
            expect(result.type).toBe('valid');
            expect(result.domain).toBe('gmail.com');
            expect(result.errors).toBeUndefined();
        });

        it('returns invalid result for a malformed email', () => {
            const result = validateEmailDetailed('not-an-email');

            expect(result.isValid).toBe(false);
            expect(result.type).toBe('invalid');
            expect(result.errors).toContain('Invalid email format');
        });

        it('flags disposable domains', () => {
            const result = validateEmailDetailed('test@mailinator.com');

            expect(result.isValid).toBe(false);
            expect(result.type).toBe('invalid');
            expect(result.errors).toContain('Disposable email addresses are not allowed');
        });

        it('flags corporate domains', () => {
            const result = validateEmailDetailed('admin@company.com');

            expect(result.isValid).toBe(true);
            expect(result.type).toBe('corporate');
        });

        it('includes a suggestion for typo domains', () => {
            const result = validateEmailDetailed('user@gmail.co');

            expect(result.suggestion).toBe('user@gmail.com');
        });
    });

    describe('validateEmail', () => {
        it('returns true for a valid email', () => {
            expect(validateEmail('user@example.com')).toBe(true);
        });

        it('returns false for an invalid email', () => {
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('normalizeEmail', () => {
        it('trims whitespace', () => {
            expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
        });

        it('lowercases the entire email', () => {
            expect(normalizeEmail('User@EXAMPLE.COM')).toBe('user@example.com');
        });
    });

    describe('validateEmailWithOptions', () => {
        it('uses basic format validation by default', () => {
            const result = validateEmailWithOptions('user@example.com');

            expect(result.isValid).toBe(true);
        });

        it('uses strict format validation when strictFormat is true', () => {
            const result = validateEmailWithOptions('user@example.com', { strictFormat: true });

            expect(result.isValid).toBe(true);
        });

        it('rejects disposable emails by default', () => {
            const result = validateEmailWithOptions('test@mailinator.com');

            expect(result.isValid).toBe(false);
        });

        it('allows disposable emails when allowDisposable is true', () => {
            const result = validateEmailWithOptions('test@mailinator.com', { allowDisposable: true });

            expect(result.isValid).toBe(true);
        });

        it('enforces custom allowed domains', () => {
            const result = validateEmailWithOptions('user@other.com', {
                customDomains: { allowed: ['mycompany.com'] }
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Domain other.com is not allowed');
        });

        it('enforces custom blocked domains', () => {
            const result = validateEmailWithOptions('user@blocked.com', {
                customDomains: { blocked: ['blocked.com'] }
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Domain blocked.com is blocked');
        });

        it('requires corporate email when requireCorporate is true', () => {
            const result = validateEmailWithOptions('user@gmail.com', { requireCorporate: true });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Corporate email address required');
        });

        it('passes when requireCorporate is true and email is corporate', () => {
            const result = validateEmailWithOptions('user@company.com', { requireCorporate: true });

            expect(result.isValid).toBe(true);
            expect(result.type).toBe('corporate');
        });
    });

    describe('validateEmailField', () => {
        it('returns success for a valid email', () => {
            const result = validateEmailField('user@example.com');

            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('returns the first error for an invalid email', () => {
            const result = validateEmailField('invalid');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('includes a suggestion when applicable', () => {
            const result = validateEmailField('user@gmail.co');

            expect(result.suggestion).toBe('user@gmail.com');
        });
    });
});
