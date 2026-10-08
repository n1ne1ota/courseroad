'use client';

import { logs } from '@/lib/logging/client';

/**
 * @module otp-pending
 * @description
 * Manages temporary client-side state for the email verification flow using secure, short-lived cookies.
 *
 * **Important Security Note:**
 * This is a lightweight UX enhancement for the OTP flow. Better Auth maintains the authoritative
 * verification state in the database. This client-side cookie is only used to:
 * - Pre-fill the email on the OTP page if user refreshes
 * - Provide continuity in the verification flow
 *
 * **Limitations:**
 * - Client-side cookies are accessible via JavaScript (less secure than HttpOnly)
 * - Can be cleared by the user
 * - Should never be used for authorization decisions
 * - Better Auth's database state is the source of truth
 *
 * @see {@link https://www.better-auth.com/docs/concepts/email-verification}
 */

/**
 * The name of the cookie used to store the pending email address.
 */
const COOKIE_NAME = 'otp-pending-email' as const;

/**
 * The maximum age of the cookie in seconds (10 minutes).
 * Matches the typical OTP expiration time.
 */
const COOKIE_MAX_AGE = 600 as const;

/**
 * Validates that an email string is not empty and contains basic email structure
 * This is a minimal check since full validation happens server-side
 */
function isValidEmail(email: string): boolean {
    return typeof email === 'string' && email.length > 0 && email.includes('@');
}

/**
 * Sets the user's email in a cookie to track the OTP verification state.
 * The email is URI-encoded to handle special characters safely.
 *
 * @param email - The user's email address to store
 * @throws {Error} If email is invalid or empty
 *
 * @example
 * ```ts
 * otpPending.setEmail('user@example.com');
 * ```
 */
function setEmail(email: string): void {
    if (typeof window === 'undefined') return;

    if (!isValidEmail(email)) {
        logs.auth.warn('OTP Pending: Invalid email provided, not setting cookie');
        return;
    }

    try {
        const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
        const cookieString = `${COOKIE_NAME}=${encodedEmail}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Strict; Secure`;

        document.cookie = cookieString;
    } catch (error) {
        logs.auth.error('OTP Pending: Failed to set email cookie', error);
    }
}

/**
 * Retrieves the pending email address from the cookie.
 *
 * @returns The decoded, normalized email address if exists, otherwise null
 *
 * @example
 * ```ts
 * const email = otpPending.getEmail();
 * if (email) {
 *   console.log('Pending verification for:', email);
 * }
 * ```
 */
function getEmail(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const cookies = document.cookie.split(';');

        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');

            if (name === COOKIE_NAME && value) {
                const decodedEmail = decodeURIComponent(value);
                return isValidEmail(decodedEmail) ? decodedEmail : null;
            }
        }
    } catch (error) {
        logs.auth.error('OTP Pending: Failed to read email cookie', error);
    }

    return null;
}

/**
 * Clears the OTP pending state by deleting the corresponding cookie.
 * This should be called after successful verification or when user cancels.
 *
 * @example
 * ```ts
 * // After successful OTP verification
 * otpPending.clear();
 * router.push('/dashboard');
 * ```
 */
function clear(): void {
    if (typeof window === 'undefined') return;

    try {
        // Set cookie with past expiration to delete it
        const cookieString = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict; Secure`;
        document.cookie = cookieString;
    } catch (error) {
        logs.auth.error('OTP Pending: Failed to clear email cookie', error);
    }
}

/**
 * A utility object that bundles the OTP state management functions.
 * This provides a clean, namespace-style API for managing OTP verification state.
 *
 * **Usage Pattern:**
 * 1. After signup: `otpPending.setEmail(email)` then redirect to /otp
 * 2. On OTP page: `const email = otpPending.getEmail()` to pre-fill
 * 3. After verification: `otpPending.clear()` to cleanup
 *
 * @example
 * ```ts
 * import { otpPending } from '@/lib/auth/otp-pending';
 *
 * // Store email after signup
 * otpPending.setEmail('user@example.com');
 *
 * // Retrieve on OTP page
 * const email = otpPending.getEmail();
 *
 * // Clear after verification
 * otpPending.clear();
 * ```
 */
export const otpPending = {
    clear,
    getEmail,
    setEmail
} as const;
