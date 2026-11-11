/** JSON projection consumed by the authenticated signal inspector. */
export type VisitorSignals = {
    ipAddress: string | null;
    driftCount: number;
    firstSeenAt: string;
    lastSeenAt: string;
    audioHash: string | null;
    canvasHash: string | null;
    fullHash: string | null;
    stableHash: string | null;
    deviceMemory: number | null;
    hardwareConcurrency: number | null;
    platform: string | null;
    screenHeight: number | null;
    screenWidth: number | null;
    userAgent: string | null;
    webglRenderer: string | null;
    webglVendor: string | null;
};
