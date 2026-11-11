import { z } from 'zod';

/**
 * Zod schema for validating the raw ThumbmarkJS payload at the server action boundary.
 *
 * All fields are nullable since any given browser may not support a particular API.
 * Size constraints prevent payload abuse from malicious clients.
 */
export const rawFingerprintSchema = z.object({
    audioHash: z.string().max(256).nullable(),
    canvasHash: z.string().max(256).nullable(),
    colorDepth: z.number().int().positive().nullable(),
    deviceMemory: z.number().positive().nullable(),
    fontsList: z.array(z.string().max(100)).max(500).nullable(),
    hardwareConcurrency: z.number().int().positive().nullable(),
    platform: z.string().max(100).nullable(),
    screenHeight: z.number().int().positive().nullable(),
    screenWidth: z.number().int().positive().nullable(),
    timezone: z.string().max(100).nullable(),
    webglRenderer: z.string().max(256).nullable(),
    webglVendor: z.string().max(256).nullable()
});

export type RawFingerprintInput = z.infer<typeof rawFingerprintSchema>;
