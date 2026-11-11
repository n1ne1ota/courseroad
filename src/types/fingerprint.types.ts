/**
 * Raw signals extracted by ThumbmarkJS via getFingerprintData()
 * All fields are nullable since any given browser may not support a particular API
 */
export interface RawFingerprintSignals {
    audioHash: string | null;
    // Biometric
    canvasHash: string | null;
    colorDepth: number | null;
    deviceMemory: number | null;
    fontsList: string[] | null;
    // High-stability (hardware)
    hardwareConcurrency: number | null;
    platform: string | null;

    screenHeight: number | null;
    screenWidth: number | null;
    timezone: string | null;
    webglRenderer: string | null;
    webglVendor: string | null;
}

/**
 * Signals after server-side enrichment with headers()
 * Extends raw signals with network data extracted from the request
 */
export interface EnrichedFingerprintSignals extends RawFingerprintSignals {
    acceptLanguage: string | null;
    ipAddress: string | null;
    userAgent: string | null;
}

/**
 * Result of the fuzzy matching engine
 * Returned by calculateSimilarity() and identifyOrCreateVisitor()
 */
export interface FingerprintMatch {
    /** Signal names that changed (drifted) from the stored record */
    driftedFields: string[];
    /** Whether a new visitorId was generated (no match found) */
    isNew: boolean;
    /** Signal names that matched exactly */
    matchedFields: string[];
    /** Similarity score (0-100) from the weighted algorithm */
    score: number;
    /** The stable device identifier */
    visitorId: string;
}

/**
 * React context value exposed by FingerprintProvider
 * Consumed via the useFingerprint() hook
 */
export interface FingerprintContextValue {
    /** Whether the fingerprint identification is currently running */
    isIdentifying: boolean;
    /** The resolved visitor ID, null while identification is in progress */
    visitorId: string | null;
}
