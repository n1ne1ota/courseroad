import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { createAuthAction } from '@/server/actions/create-auth-action';
import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
import { uploadBase64Image } from '@/server/media/image-upload-service';

export const updateInstructorProfile = createAuthAction(
    z.object({
        bio: z.string().max(1000, 'Biography must be 1000 characters or less').optional().nullable(),
        firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
        githubUrl: z.string().max(200, 'GitHub link is too long').optional().nullable(),
        image: z.string().optional().nullable(),
        lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
        twitterUrl: z.string().max(200, 'Twitter link is too long').optional().nullable(),
        username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username is too long'),
        websiteUrl: z.string().max(200, 'Website link is too long').optional().nullable()
    }),
    async (data, { user }) => {
        await getPlatformUser('creator');
        try {
            const { bio, firstName, githubUrl, image, lastName, twitterUrl, username, websiteUrl } = data;

            // Check if username is taken by another user
            const existingUser = await prismaClient.user.findFirst({
                where: {
                    NOT: { id: user.id },
                    username
                }
            });

            if (existingUser) {
                throw new Error('Username is already taken.');
            }

            let finalImageUrl = image;
            if (image && image.startsWith('data:image/')) {
                finalImageUrl = await uploadBase64Image({
                    base64DataUrl: image,
                    prefixId: user.id,
                    scope: 'avatar',
                    userId: user.id
                });
            }

            await prismaClient.user.update({
                data: {
                    bio: bio ?? null,
                    firstName,
                    githubUrl: githubUrl ?? null,
                    image: finalImageUrl ?? null,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    twitterUrl: twitterUrl ?? null,
                    username,
                    websiteUrl: websiteUrl ?? null
                },
                where: { id: user.id }
            });

            revalidatePath('/creator/dashboard/profile', 'page');
            revalidatePath('/creator/dashboard', 'page');

            return { success: true };
        } catch (error) {
            console.error('Failed to update instructor profile:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to update profile.');
        }
    }
);
