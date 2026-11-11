'use client';

import { logs } from '@/lib/logging/client';
/**
 * @module otp-rate-limit
 * @description
 * Simple client-side rate limiting for OTP resend requests.
 * Prevents abuse and improves UX by enforcing cooldown periods.
 *
 * **Note:** This is a UX enhancement only. Server-side rate limiting
 * (via Arcjet or similar) provides the real security protection.
 */

interface RateLimitState {
    attemptCount: number;
    lastAttemptTime: number;
}

const STORAGE_KEY = 'otp-rate-limit' as const;
const COOLDOWN_MS = 60000 as const; // 1 minute
const MAX_ATTEMPTS_PER_HOUR = 5 as const;

/**
 * Gets the current rate limit state from storage
 */
function getState(): RateLimitState | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const state = JSON.parse(stored) as RateLimitState;

        // Clear if data is older than 1 hour
        if (Date.now() - state.lastAttemptTime > 3600000) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return state;
    } catch {
        return null;
    }
}

/**
 * Saves the rate limit state to storage
 */
function setState(state: RateLimitState): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        logs.auth.error('Rate Limit: Failed to save state', error);
    }
}

/**
 * Checks if an OTP resend request can be made
 *
 * @returns Object with canProceed flag and wait time in seconds if blocked
 *
 * @example
 * ```ts
 * const { canProceed, waitSeconds } = canResendOtp();
 * if (!canProceed) {
 *   toast.error(`Please wait ${waitSeconds}s before resending`);
 *   return;
 * }
 * // Proceed with OTP resend
 * ```
 */
export function canResendOtp(): { canProceed: boolean; waitSeconds?: number } {
    const state = getState();

    if (!state) {
        return { canProceed: true };
    }

    const timeSinceLastAttempt = Date.now() - state.lastAttemptTime;

    // Check cooldown period
    if (timeSinceLastAttempt < COOLDOWN_MS) {
        const waitMs = COOLDOWN_MS - timeSinceLastAttempt;
        return {
            canProceed: false,
            waitSeconds: Math.ceil(waitMs / 1000)
        };
    }

    // Check hourly limit
    if (state.attemptCount >= MAX_ATTEMPTS_PER_HOUR) {
        return {
            canProceed: false,
            waitSeconds: Math.ceil((3600000 - timeSinceLastAttempt) / 1000)
        };
    }

    return { canProceed: true };
}

/**
 * Records an OTP resend attempt
 * Call this after successfully sending an OTP
 *
 * @example
 * ```ts
 * const result = await sendOtpVerificationEmail(email);
 * if (result.success) {
 *   recordOtpAttempt();
 * }
 * ```
 */
export function recordOtpAttempt(): void {
    const state = getState();
    const now = Date.now();

    if (!state) {
        setState({
            attemptCount: 1,
            lastAttemptTime: now
        });
        return;
    }

    // Reset count if more than 1 hour has passed
    if (now - state.lastAttemptTime > 3600000) {
        setState({
            attemptCount: 1,
            lastAttemptTime: now
        });
        return;
    }

    setState({
        attemptCount: state.attemptCount + 1,
        lastAttemptTime: now
    });
}

/**
 * Clears the rate limit state
 * Useful for testing or after successful verification
 */
export function clearRateLimit(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        logs.auth.error('Rate Limit: Failed to clear state', error);
    }
}
