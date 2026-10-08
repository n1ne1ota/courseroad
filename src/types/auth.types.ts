/**
 * Normalized authentication error structure
 * Provides consistent error information across all auth operations
 */
export interface AuthError {
    /** Optional error code for programmatic handling */
    code?: string;
    /** Optional field that caused the error (for validation errors) */
    field?: string;
    /** Human-readable error message */
    message: string;
    /** Original error object for debugging */
    originalError?: unknown;
}

/**
 * Standard result type for all authentication operations
 * Ensures consistent return types across auth functions
 *
 * @template T Optional data type returned on success
 */
export type AuthResult<T = void> = { success: true; data?: T } | { success: false; error: AuthError };

/**
 * Metadata for a registered WebAuthn passkey credential
 * Returned by the Better Auth passkey plugin when listing user credentials
 */
export interface PasskeyInfo {
    /** Unique identifier of the passkey record */
    id: string;
    /** User-defined label for the credential (e.g. "MacBook Touch ID") */
    name?: string | null;
    /** Authenticator device type reported during registration */
    deviceType?: string;
    /** Whether the credential is backed up / synced across devices */
    backedUp?: boolean;
    /** Authenticator AAGUID, used to resolve a human-readable provider name */
    aaguid?: string | null;
    /** Timestamp the passkey was registered */
    createdAt?: string | Date | null;
}
