import 'server-only';

import type Stripe from 'stripe';

/** Configuration needed to create a Stripe instance */
export interface StripeConfig {
    /** API version to pin */
    apiVersion: string;
    /** App name for Stripe metadata */
    appName: string;
    /** App version for Stripe metadata */
    appVersion: string;
    /** Stripe secret API key */
    secretKey: string;
}

/** Result of creating or retrieving a connected account */
export interface ConnectAccountResult {
    accountId: string;
    isNew: boolean;
}

/** Connected account status */
export interface AccountStatus {
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
}

/** Logger interface for injectable logging */
export interface PaymentsLogger {
    error: (message: string, error?: unknown) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
}

/** Full Stripe Account type re-export for consumer convenience */
export type { Stripe };
