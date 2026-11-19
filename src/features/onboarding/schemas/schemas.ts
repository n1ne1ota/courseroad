import { z } from 'zod';

import { organizationMemberRoles } from '@/lib/auth/org-role-policy';
import { selfServicePlatformRoles } from '@/lib/auth/self-service-roles';
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

export const MAX_TEAM_INVITES = 5;

/** Stable editable rows; blank email rows are optional, populated rows must be valid. */
export const inviteRowSchema = z
    .object({
        id: z.string().min(1),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .refine(
                email => email === '' || onboardingEmailSchema.safeParse(email).success,
                'Enter a valid, non-disposable email address.'
            ),
        role: z.enum(organizationMemberRoles)
    })
    .strict();

/** Reject duplicate recipients before creation, including conflicting role selections. */
export const inviteRowsSchema = z
    .array(inviteRowSchema)
    .max(MAX_TEAM_INVITES)
    .superRefine((rows, context) => {
        const emails = new Set<string>();
        rows.forEach((row, index) => {
            if (!row.email) return;
            if (emails.has(row.email))
                context.addIssue({
                    code: 'custom',
                    path: [index, 'email'],
                    message: 'Each email address can only be invited once.'
                });
            emails.add(row.email);
        });
    })
    .transform(rows => rows.filter(row => row.email !== ''));

export type OrganizationInviteRow = z.infer<typeof inviteRowSchema>;

export type WorkspaceDetailsInput = z.infer<typeof workspaceDetailsSchema>;
export type IntentInput = z.infer<typeof intentSchema>;

/** Profile fields accepted when completing onboarding. */
export const completeOnboardingSchema = z.object({
    role: z.enum(selfServicePlatformRoles).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    websiteUrl: z.string().optional(),
    username: z.string().optional(),
    image: z.string().optional(),
    twitterUrl: z.string().optional(),
    githubUrl: z.string().optional()
});
