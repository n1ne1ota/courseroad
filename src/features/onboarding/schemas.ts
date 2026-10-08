import { z } from 'zod';

import { createEmailSchema } from '@/lib/utils/email-validation';

/**
 * Validation schema for the Workspace Details step.
 * Enforces a non-empty name and a URL-safe slug between 3 and 30 characters.
 */
export const workspaceDetailsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Organization name is required.')
        .max(100, 'Organization name must be less than 100 characters.'),
    slug: z
        .string()
        .trim()
        .min(3, 'Slug must be at least 3 characters.')
        .max(30, 'Slug must be less than 30 characters.')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.')
});

/**
 * Validation schema for the Intent step.
 */
export const intentEnum = z.enum([
    'selling-courses',
    'internal-training',
    'bootcamp',
    'hobby',
    'academic',
    'other',
    'customer-education',
    'non-profit',
    'content-creator',
    'employee-onboarding',
    'compliance',
    'coaching',
    'certification',
    'other-custom'
]);

export type Intent = z.infer<typeof intentEnum>;

export const intentSchema = intentEnum.nullable();

/**
 * Validation schema for individual invite emails.
 * Uses shared email validation rules (no disposable email, strict format checks).
 */
export const onboardingEmailSchema = createEmailSchema({
    allowDisposable: false,
    strictFormat: true
});

/**
 * Validation schema for the list of invite emails.
 * Filters empty lines and validates the formatted emails.
 */
export const inviteEmailsSchema = z.array(onboardingEmailSchema);

export type WorkspaceDetailsInput = z.infer<typeof workspaceDetailsSchema>;
export type IntentInput = z.infer<typeof intentSchema>;
export type InviteEmailsInput = z.infer<typeof inviteEmailsSchema>;

/** Profile fields accepted when completing onboarding. */
export const completeOnboardingSchema = z.object({
    role: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    websiteUrl: z.string().optional(),
    username: z.string().optional(),
    image: z.string().optional(),
    twitterUrl: z.string().optional(),
    githubUrl: z.string().optional()
});
