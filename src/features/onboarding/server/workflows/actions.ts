import 'server-only';

import { headers } from 'next/headers';

import { isSelfServicePlatformRole, selfServicePlatformRoles } from '@/lib/auth/self-service-roles';

import { completeOnboardingSchema } from '@/features/onboarding/schemas/schemas';
import { createAuthAction } from '@/server/actions/create-auth-action';
import { auth } from '@/server/auth/auth';
import { prismaClient as prisma } from '@/server/db/client';
import { logs } from '@/server/logging/server';
import { uploadBase64Image } from '@/server/media/image-upload-service';

/** Complete the authenticated user's onboarding and profile setup. */
export const completeOnboarding = createAuthAction(
    completeOnboardingSchema,
    async ({ role, firstName, lastName, bio, websiteUrl, username, image, twitterUrl, githubUrl }, { user }) => {
        if (role && !isSelfServicePlatformRole(user.role)) {
            return { error: 'This account role must be managed by an administrator.' };
        }
        try {
            let finalImageUrl = image;
            if (image && image.startsWith('data:image/')) {
                try {
                    finalImageUrl = await uploadBase64Image({
                        base64DataUrl: image,
                        prefixId: user.id,
                        scope: 'avatar',
                        userId: user.id
                    });
                } catch (err) {
                    logs.db.error('Failed to upload user avatar to Bunny', err);
                    return { error: 'Failed to process and upload profile image.' };
                }
            }

            if (username) {
                const trimmedUsername = username.trim();
                if (trimmedUsername.length < 3) {
                    return { error: 'Username must be at least 3 characters.' };
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
                    return { error: 'Username can only contain alphanumeric characters, underscores, and hyphens.' };
                }
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username: { equals: trimmedUsername, mode: 'insensitive' },
                        id: { not: user.id }
                    }
                });
                if (existingUser) {
                    return { error: 'Username is already taken.' };
                }
            }

            // The admin plugin forbids role input on updateUser. Only this validated,
            // authenticated workflow may select a persona, with a database role guard
            // so a stale session cannot downgrade an administrative account.
            const profileData = {
                ...(role ? { role } : {}),
                ...(bio !== undefined ? { bio } : {}),
                ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl.trim() } : {}),
                ...(twitterUrl !== undefined ? { twitterUrl: twitterUrl.trim() } : {}),
                ...(githubUrl !== undefined ? { githubUrl: githubUrl.trim() } : {})
            };
            if (role) {
                const updated = await prisma.user.updateMany({
                    data: profileData,
                    where: { id: user.id, role: { in: [...selfServicePlatformRoles] } }
                });
                if (updated.count !== 1) {
                    return { error: 'This account role must be managed by an administrator.' };
                }
            } else {
                await prisma.user.update({ data: profileData, where: { id: user.id } });
            }

            // Better Auth returns the updated database user when refreshing the
            // cookie, including the persona saved above. Complete onboarding last.
            await auth.api.updateUser({
                body: {
                    firstName: firstName?.trim() || undefined,
                    image: finalImageUrl || undefined,
                    lastName: lastName?.trim() || undefined,
                    onboardingComplete: true,
                    username: username?.trim() || undefined
                },
                headers: await headers()
            });

            return { success: true };
        } catch (error) {
            logs.db.error('Failed to complete onboarding', error);
            throw new Error('Failed to complete onboarding');
        }
    }
);
