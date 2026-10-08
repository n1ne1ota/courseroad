'use client';

import { passkeyClient } from '@better-auth/passkey/client';
import { showToast } from '@courseroad/iota-ui';
import {
    adminClient,
    anonymousClient,
    emailOTPClient,
    jwtClient,
    lastLoginMethodClient,
    magicLinkClient,
    multiSessionClient,
    organizationClient,
    twoFactorClient
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { orgAc, orgCreator, orgInstructor, orgLearner, orgManager, orgOwner } from '@/lib/auth/org-permissions';
import { ac, admin, creator, learner, staff } from '@/lib/auth/permissions';
import { forgotPasswordSchema, loginSchema, otpSchema, resetPasswordSchema, signupSchema } from '@/lib/auth/schemas';
import { logs } from '@/lib/logging/client';

import type { AuthResult, PasskeyInfo } from '@/types/auth.types';

import { normalizeAuthError } from './normalize-auth-error';
import { otpPending } from './otp-pending';
export { otpPending };

/**
 * Better Auth client instance configured with email OTP plugin
 * Handles all authentication API calls and session management
 *
 * The baseURL is intentionally omitted so Better Auth falls back to `/api/auth`
 * (relative to the current origin). This avoids NetworkError when the dev server
 * auto-selects a different port because 3000 is already in use.
 */
export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        adminClient({
            ac,
            roles: {
                admin,
                creator,
                learner,
                staff
            }
        }),
        organizationClient({
            ac: orgAc,
            roles: {
                creator: orgCreator,
                instructor: orgInstructor,
                learner: orgLearner,
                manager: orgManager,
                owner: orgOwner
            }
        }),
        twoFactorClient({
            twoFactorPage: '/two-factor'
        }),
        magicLinkClient(),
        multiSessionClient(),
        jwtClient(),
        passkeyClient(),
        lastLoginMethodClient(),
        anonymousClient()
    ]
});

/**
 * Re-exported Better Auth hooks and methods for direct use
 * Use these for low-level auth operations or when you need direct API access
 */
export const { signIn, signOut, signUp, useSession } = authClient;

/**
 * Creates an anonymous guest session. Used by the public demo quiz so a
 * visitor can submit answers without registering; the guest's learner data is
 * later migrated to their real account via the `anonymous` plugin's
 * `onLinkAccount` hook when they sign up.
 *
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function signInAnonymously(): Promise<AuthResult<void>> {
    try {
        const { error } = await authClient.signIn.anonymous();
        if (error) {
            const normalizedError = normalizeAuthError(error, 'Failed to start a guest session. Please try again.');
            return { error: normalizedError, success: false };
        }
        return { success: true };
    } catch (error) {
        logs.auth.error('Anonymous sign in error', error);
        const normalizedError = normalizeAuthError(error, 'Failed to start a guest session. Please try again.');
        return { error: normalizedError, success: false };
    }
}

/**
 * Initiates GitHub OAuth authentication flow
 * Redirects user to GitHub for authorization
 *
 * @param callbackURL - URL to redirect to after successful authentication (defaults to '/')
 * @returns Promise resolving to AuthResult indicating success or failure
 *
 * @example
 * ```tsx
 * const result = await signInUserWithGitHub('/dashboard');
 * if (result.success) {
 *    // User will be redirected to GitHub
 * }
 * ```
 */
export async function signInWithGitHub(callbackURL?: string): Promise<AuthResult<void>> {
    try {
        await authClient.signIn.social({
            callbackURL: callbackURL || '/',
            provider: 'github'
        });

        showToast({
            description: 'Signing in with GitHub',
            scheme: 'primary',
            title: 'Redirecting'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('GitHub sign in error', error);

        const normalizedError = normalizeAuthError(error, 'Failed to sign in with GitHub. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Sign In Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Initiates Google OAuth authentication flow
 * Redirects user to Google for authorization
 *
 * @param callbackURL - URL to redirect to after successful authentication (defaults to '/')
 * @returns Promise resolving to AuthResult indicating success or failure
 *
 * @example
 * ```tsx
 * const result = await signInUserWithGoogle('/dashboard');
 * if (result.success) {
 *    // User will be redirected to Google
 * }
 * ```
 */
export async function signInWithGoogle(callbackURL?: string): Promise<AuthResult<void>> {
    try {
        await authClient.signIn.social({
            callbackURL: callbackURL || '/',
            provider: 'google'
        });

        showToast({
            description: 'Signing in with Google',
            scheme: 'primary',
            title: 'Redirecting'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Google sign in error', error);

        const normalizedError = normalizeAuthError(error, 'Failed to sign in with Google. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Sign In Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Authenticates user with email and password credentials
 * Performs client-side validation before making API call
 *
 * @param email - User's email address (must be valid format)
 * @param password - User's password (minimum 1 character for login)
 * @returns Promise resolving to AuthResult with success/error state
 *
 * @example
 * ```tsx
 * const result = await signInUserWithEmail('user@example.com', 'password123');
 * if (result.success) {
 *     router.push('/dashboard');
 * } else {
 *     console.error(result.error.message);
 * }
 * ```
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult<void>> {
    try {
        // Client-side validation using Zod schema
        const validation = loginSchema.safeParse({ email, password });

        if (!validation.success) {
            const normalizedError = normalizeAuthError(validation.error, 'Invalid email or password format');

            showToast({
                description: normalizedError.message,
                scheme: 'warning',
                title: 'Validation Error'
            });

            return { error: normalizedError, success: false };
        }

        // Call Better Auth API
        const result = await authClient.signIn.email({
            email,
            password
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Invalid email or password.');

            showToast({
                description: normalizedError.message,
                scheme: 'danger',
                title: 'Sign In Failed'
            });

            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'You have successfully signed in.',
            scheme: 'success',
            title: 'Welcome Back!'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Email sign in error', error);

        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Sign In Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Creates a new user account with email and password
 * Validates input, creates account, and initiates email verification flow
 *
 * @param username - User's display name/username (2-50 chars, alphanumeric with - and _)
 * @param email - User's email address (must be valid, non-disposable format)
 * @param password - User's password (min 8 chars, must include uppercase, lowercase, and number)
 * @param confirmPassword - Password confirmation (must match password)
 * @returns Promise resolving to AuthResult with success/error state
 *
 * @remarks
 * On success, automatically sets OTP pending state and user must verify email
 *
 * @example
 * ```tsx
 * const result = await signUpUserWithEmail(
 *   'user@example.com',
 *   'SecurePass123',
 *   'SecurePass123',
 *   'johndoe'
 * );
 * if (result.success) {
 *   router.push('/otp'); // Redirect to verification
 * }
 * ```
 */
export async function signUpWithEmail(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<AuthResult<void>> {
    try {
        // Client-side validation using Zod schema
        const validation = signupSchema.safeParse({
            confirmPassword,
            email,
            firstName,
            lastName,
            password,
            username
        });

        if (!validation.success) {
            const normalizedError = normalizeAuthError(validation.error, 'Invalid signup information');

            showToast({
                description: normalizedError.message,
                scheme: 'warning',
                title: 'Validation Error'
            });

            return { error: normalizedError, success: false };
        }

        // Call Better Auth API
        const result = await authClient.signUp.email({
            email,
            // @ts-expect-error Additional fields specified in server config
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            password,
            username
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Failed to create account.');

            showToast({
                description: normalizedError.message,
                scheme: 'danger',
                title: 'Sign Up Failed'
            });

            return { error: normalizedError, success: false };
        }

        // Set OTP pending state for email verification flow
        otpPending.setEmail(email);

        showToast({
            description: 'Please verify your email to continue.',
            scheme: 'success',
            title: 'Account Created'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Email sign up error', error);

        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Sign Up Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Sends a one-time password (OTP) verification code to user's email
 * Used for email verification during signup or verification resend
 *
 * @param email - Email address to send OTP to (must be valid format)
 * @returns Promise resolving to AuthResult indicating success or failure
 *
 * @remarks
 * OTP codes are typically 6 digits and expire after a short period (usually 10 minutes)
 *
 * @example
 * ```tsx
 * const result = await sendOtpVerificationEmail('user@example.com');
 * if (result.success) {
 *     // Show OTP input form
 * }
 * ```
 */
export async function sendOtpVerificationEmail(email: string): Promise<AuthResult<void>> {
    try {
        const result = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: 'email-verification'
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not send verification code.');

            showToast({
                description: normalizedError.message,
                scheme: 'danger',
                title: 'Failed to Send Code'
            });

            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'A new verification code has been sent to your email.',
            scheme: 'success',
            title: 'Code Sent'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Send OTP error', error);

        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Failed to Send Code'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Verifies user's email address using OTP code
 * Completes the email verification flow and activates the account
 *
 * @param email - Email address being verified (must match signup email)
 * @param otp - 6-digit verification code sent to email
 * @returns Promise resolving to AuthResult indicating success or failure
 *
 * @remarks
 * On success:
 * - Clears OTP pending state
 * - Activates user account
 * - User can now sign in
 *
 * @example
 * ```tsx
 * const result = await verifyEmailWithOtp('user@example.com', '123456');
 * if (result.success) {
 *   router.push('/sign-in'); // Redirect to login
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export async function verifyEmailWithOtp(email: string, otp: string): Promise<AuthResult<void>> {
    try {
        // Client-side validation using Zod schema
        const validation = otpSchema.safeParse({ email, otp });

        if (!validation.success) {
            const normalizedError = normalizeAuthError(validation.error, 'Invalid verification code format');

            showToast({
                description: normalizedError.message,
                scheme: 'warning',
                title: 'Invalid Code'
            });

            return { error: normalizedError, success: false };
        }

        // Call Better Auth API
        const result = await authClient.emailOtp.verifyEmail({
            email,
            otp
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Invalid or expired code.');

            showToast({
                description: normalizedError.message,
                scheme: 'danger',
                title: 'Verification Failed'
            });

            return { error: normalizedError, success: false };
        }

        // Clear OTP pending state after successful verification
        otpPending.clear();

        showToast({
            description: 'Your account has been verified successfully.',
            scheme: 'success',
            title: 'Email Verified!'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Verify OTP error', error);

        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Verification Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Signs out the currently authenticated user
 * Clears the current session and auth cookies
 *
 * @returns Promise resolving to AuthResult indicating success or failure
 *
 * @remarks
 * On success:
 * - Invalidates session token
 * - Clears auth cookies
 * - The calling Client Component is responsible for navigation after sign-out
 *
 * @example
 * ```tsx
 * const result = await signOutUser();
 * if (result.success) {
 *   router.push('/');
 * }
 * ```
 */
export async function signOutUser(): Promise<AuthResult<void>> {
    try {
        await authClient.signOut();

        showToast({
            description: 'You have been signed out successfully.',
            scheme: 'success',
            title: 'Signed Out'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Sign out error', error);

        const normalizedError = normalizeAuthError(error, 'An error occurred while signing out.');

        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Sign Out Failed'
        });

        return { error: normalizedError, success: false };
    }
}

/**
 * Requests a password reset email for the user
 *
 * @param email - User's email address
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function requestPasswordResetEmail(email: string): Promise<AuthResult<void>> {
    try {
        const validation = forgotPasswordSchema.safeParse({ email });

        if (!validation.success) {
            const normalizedError = normalizeAuthError(validation.error, 'Invalid email format');
            showToast({ description: normalizedError.message, scheme: 'warning', title: 'Validation Error' });
            return { error: normalizedError, success: false };
        }

        const redirectTo = new URL('/new-password', window.location.origin).toString();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (authClient as any).forgetPassword({
            email,
            redirectTo
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not send reset link.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Request Failed' });
            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'If an account exists, a reset link has been sent.',
            scheme: 'success',
            title: 'Reset Link Sent'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Password reset request error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Request Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Resets user password using a valid token
 *
 * @param token - Reset token from email
 * @param password - New password
 * @param confirmPassword - New password confirmation
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function resetPasswordWithToken(
    token: string,
    password: string,
    confirmPassword: string
): Promise<AuthResult<void>> {
    try {
        const validation = resetPasswordSchema.safeParse({ confirmPassword, password, token });

        if (!validation.success) {
            const normalizedError = normalizeAuthError(validation.error, 'Invalid password format');
            showToast({ description: normalizedError.message, scheme: 'warning', title: 'Validation Error' });
            return { error: normalizedError, success: false };
        }

        const result = await authClient.resetPassword({
            newPassword: password,
            token
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not reset password.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Reset Failed' });
            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'Your password has been successfully reset.',
            scheme: 'success',
            title: 'Password Reset'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Password reset error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Reset Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Sends a magic link to the user's email for passwordless sign in
 *
 * @param email - User's email address
 * @param callbackURL - URL to redirect to after verification (defaults to '/')
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function signInWithMagicLink(email: string, callbackURL?: string): Promise<AuthResult<void>> {
    try {
        const result = await authClient.signIn.magicLink({
            callbackURL: callbackURL || '/',
            email
        });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Failed to send magic link.');
            showToast({
                description: normalizedError.message,
                scheme: 'danger',
                title: 'Request Failed'
            });
            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'A sign-in link has been sent to your email address.',
            scheme: 'success',
            title: 'Magic Link Sent'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Magic link sign in error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({
            description: normalizedError.message,
            scheme: 'danger',
            title: 'Request Failed'
        });
        return { error: normalizedError, success: false };
    }
}

/**
 * Indicates whether the current browser exposes the WebAuthn API.
 * Used to gate passkey UI so unsupported browsers degrade gracefully.
 */
export function isPasskeySupported(): boolean {
    return typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function';
}

/**
 * Registers a new passkey for the currently authenticated user.
 * Triggers the browser's WebAuthn registration ceremony (biometric / security key).
 *
 * @param name - Friendly label for the credential (e.g. the device name)
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function registerPasskey(name: string): Promise<AuthResult<void>> {
    try {
        if (!isPasskeySupported()) {
            const normalizedError = normalizeAuthError(null, 'Passkeys are not supported on this browser or device.');
            showToast({ description: normalizedError.message, scheme: 'warning', title: 'Not Supported' });
            return { error: normalizedError, success: false };
        }

        const result = await authClient.passkey.addPasskey({ name });

        if (result?.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not register passkey.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Registration Failed' });
            return { error: normalizedError, success: false };
        }

        showToast({
            description: 'Your passkey has been registered successfully.',
            scheme: 'success',
            title: 'Passkey Added'
        });

        return { success: true };
    } catch (error) {
        logs.auth.error('Passkey registration error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Registration Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Lists all passkeys registered to the current user.
 *
 * @returns Promise resolving to AuthResult with the list of passkeys
 */
export async function listPasskeys(): Promise<AuthResult<PasskeyInfo[]>> {
    try {
        const result = await authClient.passkey.listUserPasskeys();

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not load passkeys.');
            return { error: normalizedError, success: false };
        }

        return { data: (result.data ?? []) as PasskeyInfo[], success: true };
    } catch (error) {
        logs.auth.error('List passkeys error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        return { error: normalizedError, success: false };
    }
}

/**
 * Renames an existing passkey credential.
 *
 * @param id - The passkey record ID
 * @param name - The new label for the credential
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function renamePasskey(id: string, name: string): Promise<AuthResult<void>> {
    try {
        const result = await authClient.passkey.updatePasskey({ id, name });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not rename passkey.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Rename Failed' });
            return { error: normalizedError, success: false };
        }

        showToast({ description: 'Passkey renamed.', scheme: 'success', title: 'Passkey Updated' });
        return { success: true };
    } catch (error) {
        logs.auth.error('Rename passkey error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Rename Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Deletes a passkey credential from the current user's account.
 *
 * @param id - The passkey record ID
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function deletePasskey(id: string): Promise<AuthResult<void>> {
    try {
        const result = await authClient.passkey.deletePasskey({ id });

        if (result.error) {
            const normalizedError = normalizeAuthError(result.error, 'Could not remove passkey.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Remove Failed' });
            return { error: normalizedError, success: false };
        }

        showToast({ description: 'Passkey removed.', scheme: 'success', title: 'Passkey Removed' });
        return { success: true };
    } catch (error) {
        logs.auth.error('Delete passkey error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Remove Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Signs in the user with a registered passkey via an explicit WebAuthn prompt.
 * The calling Client Component is responsible for navigation after successful sign-in.
 *
 * @returns Promise resolving to AuthResult indicating success or failure
 */
export async function signInWithPasskey(): Promise<AuthResult<void>> {
    try {
        if (!isPasskeySupported()) {
            const normalizedError = normalizeAuthError(null, 'Passkeys are not supported on this browser or device.');
            showToast({ description: normalizedError.message, scheme: 'warning', title: 'Not Supported' });
            return { error: normalizedError, success: false };
        }

        const result = await authClient.signIn.passkey();

        if (result?.error) {
            const normalizedError = normalizeAuthError(result.error, 'Passkey sign in failed.');
            showToast({ description: normalizedError.message, scheme: 'danger', title: 'Sign In Failed' });
            return { error: normalizedError, success: false };
        }

        return { success: true };
    } catch (error) {
        logs.auth.error('Passkey sign in error', error);
        const normalizedError = normalizeAuthError(error, 'An unexpected error occurred. Please try again.');
        showToast({ description: normalizedError.message, scheme: 'danger', title: 'Sign In Failed' });
        return { error: normalizedError, success: false };
    }
}

/**
 * Enables WebAuthn conditional UI (autofill) on the sign-in page.
 * Browsers surface registered passkeys directly in the email field's autofill menu.
 *
 * @returns Whether autofill completed a successful sign-in; false when unsupported or unsuccessful
 */
export async function preloadPasskeyAutofill(): Promise<boolean> {
    try {
        if (!isPasskeySupported()) return false;

        const hasConditionalUI = await window.PublicKeyCredential?.isConditionalMediationAvailable?.();
        if (!hasConditionalUI) return false;

        const result = await authClient.signIn.passkey({ autoFill: true });
        return !result?.error;
    } catch (error) {
        logs.auth.error('Passkey autofill error', error);
        return false;
    }
}
