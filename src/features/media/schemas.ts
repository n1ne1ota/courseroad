import { z } from 'zod';

export const streamWebhookSchema = z
    .object({
        EncodeProgress: z.number().optional(),
        Status: z.number(),
        VideoGuid: z.string(),
        VideoLibraryId: z.number().optional()
    })
    .loose();
