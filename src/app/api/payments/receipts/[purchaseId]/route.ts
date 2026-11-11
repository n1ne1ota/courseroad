import { z } from 'zod';

import { getReceiptUrl } from '@/features/payment/server/receipts';
import { privateRead } from '@/server/http/private-read';

export async function GET(request: Request, { params }: { params: Promise<{ purchaseId: string }> }) {
    return privateRead(async () => {
        const { purchaseId } = await params;
        const value = z
            .enum(['true', 'false'])
            .default('false')
            .parse(new URL(request.url).searchParams.get('isPlatform') ?? undefined);
        return getReceiptUrl({ purchaseId, isPlatform: value === 'true' });
    });
}
