import 'server-only';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { z } from 'zod';

import { createExpressAccount, createOnboardingLink } from '@/features/payment/server/repositories/integration';
import { auth } from '@/server/auth/auth';
import { prismaClient as prisma } from '@/server/db/client';
import { logs } from '@/server/logging/server';

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const connectSchema = z
        .object({
            organizationId: z.string().min(1, 'organizationId must be a non-empty string')
        })
        .strict();

    let organizationId: string;
    try {
        const body = connectSchema.parse(await req.json());
        organizationId = body.organizationId;
    } catch (err: unknown) {
        return new NextResponse(
            err instanceof z.ZodError
                ? JSON.stringify({ details: err.issues, error: 'Validation failed' })
                : 'Invalid request payload',
            { headers: { 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Verify the caller is an owner or manager of the target org
    const membership = await prisma.member.findUnique({
        include: { organization: { select: { slug: true } } },
        where: {
            userId_organizationId: {
                organizationId,
                userId: session.user.id
            }
        }
    });

    if (!membership || !['owner', 'manager'].includes(membership.role)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const orgSlug = membership.organization.slug;

    try {
        const { accountId } = await createExpressAccount(organizationId, session.user.email);

        const onboardingUrl = await createOnboardingLink(organizationId, {
            refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/organization/${orgSlug}/settings`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/organization/${orgSlug}/settings`
        });

        return NextResponse.json({ accountId, url: onboardingUrl });
    } catch (error) {
        logs.api.error('Payments Connect error', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
