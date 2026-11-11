import { z } from 'zod';

// Email validation result interface
export interface EmailValidationResult {
    domain?: string | undefined;
    errors?: string[] | undefined;
    isValid: boolean;
    suggestion?: string | undefined;
    type: 'valid' | 'invalid' | 'disposable' | 'risky' | 'corporate';
}

// Common email patterns and configurations
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRICT_EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Known disposable email domains
const DISPOSABLE_DOMAINS = new Set([
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'yopmail.com',
    'maildrop.cc',
    'mohmal.com',
    'sharklasers.com'
]);

// Common domain typos and their corrections
const DOMAIN_SUGGESTIONS = new Map([
    ['gmail.co', 'gmail.com'],
    ['gmail.c', 'gmail.com'],
    ['gmai.com', 'gmail.com'],
    ['gmial.com', 'gmail.com'],
    ['yahoo.co', 'yahoo.com'],
    ['yahooo.com', 'yahoo.com'],
    ['hotmai.com', 'hotmail.com'],
    ['hotmial.com', 'hotmail.com'],
    ['outlok.com', 'outlook.com'],
    ['outloo.com', 'outlook.com']
]);

// Corporate email domains (for business validation)
const CORPORATE_DOMAINS = new Set([
    'company.com',
    'corp.com',
    'enterprise.com'
    // Add your organization's domains here
]);

/**
 * Basic email format validation
 */
export function isValidEmailFormat(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Strict email format validation (RFC 5322 compliant)
 */
export function isValidEmailStrict(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    return STRICT_EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Extract domain from email address
 */
export function extractEmailDomain(email: string): string | null {
    if (!isValidEmailFormat(email)) return null;

    const [, domain] = email.trim().toLowerCase().split('@');

    return domain || null;
}

/**
 * Check if email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
    const domain = extractEmailDomain(email);

    return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Check if email domain is corporate/business
 */
export function isCorporateEmail(email: string): boolean {
    const domain = extractEmailDomain(email);

    return domain ? CORPORATE_DOMAINS.has(domain) : false;
}

/**
 * Suggest corrections for common email typos
 */
export function suggestEmailCorrection(email: string): string | null {
    const domain = extractEmailDomain(email);

    if (!domain) return null;

    const suggestion = DOMAIN_SUGGESTIONS.get(domain);

    if (suggestion) {
        const [localPart] = email.split('@');

        return `${localPart}@${suggestion}`;
    }

    return null;
}

/**
 * Comprehensive email validation with detailed results
 */
export function validateEmailDetailed(email: string): EmailValidationResult {
    const errors: string[] = [];
    let type: EmailValidationResult['type'] = 'valid';

    // Basic format validation
    if (!isValidEmailFormat(email)) {
        errors.push('Invalid email format');

        return {
            errors,
            isValid: false,
            type: 'invalid'
        };
    }

    const domain = extractEmailDomain(email);
    const suggestion = suggestEmailCorrection(email);

    // Check for disposable email
    if (isDisposableEmail(email)) {
        type = 'disposable';
        errors.push('Disposable email addresses are not allowed');
    }

    // Check for corporate email
    if (isCorporateEmail(email)) {
        type = 'corporate';
    }

    // Additional checks for risky patterns
    if (domain && domain.includes('..')) {
        type = 'risky';
        errors.push('Invalid domain format');
    }

    const isValid = errors.length === 0;

    return {
        domain: domain || undefined,
        errors: errors.length > 0 ? errors : undefined,
        isValid,
        suggestion: suggestion || undefined,
        type: isValid ? type : 'invalid'
    };
}

/**
 * Simple email validation for basic use cases
 */
export function validateEmail(email: string): boolean {
    return validateEmailDetailed(email).isValid;
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Validate email with custom options
 */
export interface EmailValidationOptions {
    allowDisposable?: boolean;
    customDomains?: {
        allowed?: string[];
        blocked?: string[];
    };
    requireCorporate?: boolean;
    strictFormat?: boolean;
}

export function validateEmailWithOptions(email: string, options: EmailValidationOptions = {}): EmailValidationResult {
    const { allowDisposable = false, customDomains, requireCorporate = false, strictFormat = false } = options;

    const normalizedEmail = normalizeEmail(email);
    const errors: string[] = [];
    let type: EmailValidationResult['type'] = 'valid';

    // Format validation
    const formatValid = strictFormat ? isValidEmailStrict(normalizedEmail) : isValidEmailFormat(normalizedEmail);

    if (!formatValid) {
        errors.push('Invalid email format');

        return {
            errors,
            isValid: false,
            type: 'invalid'
        };
    }

    const domain = extractEmailDomain(normalizedEmail);
    const suggestion = suggestEmailCorrection(normalizedEmail);

    // Custom domain validation
    if (customDomains?.allowed && domain) {
        if (!customDomains.allowed.includes(domain)) {
            errors.push(`Domain ${domain} is not allowed`);
            type = 'invalid';
        }
    }

    if (customDomains?.blocked && domain) {
        if (customDomains.blocked.includes(domain)) {
            errors.push(`Domain ${domain} is blocked`);
            type = 'invalid';
        }
    }

    // Disposable email check
    if (!allowDisposable && isDisposableEmail(normalizedEmail)) {
        type = 'disposable';
        errors.push('Disposable email addresses are not allowed');
    }

    // Corporate email requirement
    if (requireCorporate && !isCorporateEmail(normalizedEmail)) {
        errors.push('Corporate email address required');
        type = 'invalid';
    }

    const isValid = errors.length === 0;

    return {
        domain: domain || undefined,
        errors: errors.length > 0 ? errors : undefined,
        isValid,
        suggestion: suggestion || undefined,
        type: isValid ? (isCorporateEmail(normalizedEmail) ? 'corporate' : type) : 'invalid'
    };
}

/**
 * Zod schema for email validation with custom options
 */
export function createEmailSchema(options: EmailValidationOptions = {}) {
    return z.string().refine(email => validateEmailWithOptions(email, options).isValid, {
        message: 'Invalid email address'
    });
}

/**
 * Email validation middleware for forms
 */
export function validateEmailField(
    email: string,
    options?: EmailValidationOptions
): { success: boolean; error?: string | undefined; suggestion?: string | undefined } {
    const result = validateEmailWithOptions(email, options);

    return {
        error: result.errors?.[0],
        success: result.isValid,
        suggestion: result.suggestion
    };
}

// Export constants for external use
export const EMAIL_VALIDATION_PATTERNS = {
    BASIC: EMAIL_REGEX,
    STRICT: STRICT_EMAIL_REGEX
} as const;

export const EMAIL_DOMAIN_LISTS = {
    CORPORATE: CORPORATE_DOMAINS,
    DISPOSABLE: DISPOSABLE_DOMAINS,
    SUGGESTIONS: DOMAIN_SUGGESTIONS
} as const;
