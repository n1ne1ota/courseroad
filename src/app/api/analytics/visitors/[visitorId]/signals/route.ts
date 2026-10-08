import { z } from 'zod';

import { getVisitorSignals } from '@/features/analytics/server/tracking-analytics-service';
import { privateRead } from '@/server/http/private-read';

export async function GET(_request: Request, { params }: { params: Promise<{ visitorId: string }> }) {
    return privateRead(async () =>
        getVisitorSignals(
            z
                .string()
                .min(1)
                .max(255)
                .parse((await params).visitorId)
        )
    );
}
