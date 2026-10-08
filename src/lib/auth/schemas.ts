import { z } from 'zod';

import { createEmailSchema, validateEmailWithOptions } from '@/lib/utils/email-validation';

export const signupSchema = z
    .object({
        confirmPassword: z.string(),
        email: createEmailSchema({
            allowDisposable: false,
            strictFormat: true
        }),
        firstName: z.string().min(2, 'First name is required'),
        lastName: z.string().min(2, 'Last name is required'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }),
        username: z
            .string()
            .min(2, 'Username must be at least 2 characters')
            .max(50, 'Username must be less than 50 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, {
                message: 'Username can only contain letters, numbers, underscores, and dashes'
            })
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

export const loginSchema = z.object({
    email: createEmailSchema(),
    password: z.string().min(1, 'Password is required')
});

export const otpSchema = z.object({
    email: createEmailSchema(),
    otp: z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, { message: 'OTP must contain only numbers' })
});

export const forgotPasswordSchema = z.object({
    email: createEmailSchema()
});

export const resetPasswordSchema = z
    .object({
        confirmPassword: z.string(),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }),
        token: z.string().min(1, 'Reset token is required')
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

// Email validation helper for forms
export function validateEmailForAuth(email: string) {
    return validateEmailWithOptions(email, {
        allowDisposable: false,
        strictFormat: true
    });
}

// Corporate email validation for business accounts
export const corporateEmailSchema = createEmailSchema({
    allowDisposable: false,
    requireCorporate: true,
    strictFormat: true
});

// Relaxed email validation for login (allows existing accounts)
export const loginEmailSchema = createEmailSchema({
    allowDisposable: true, // Allow existing disposable emails to login
    strictFormat: false
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
