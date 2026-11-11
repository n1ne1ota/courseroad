/**
 * Authentication routes
 */
export const authRoutes = {
    newPassword: '/new-password',
    otp: '/otp',
    resetPassword: '/reset-password',
    signIn: '/sign-in',
    signUp: '/sign-up'
} as const;

/**
 * Helper to get all auth page paths as an array
 * Useful for middleware and callback URL checks
 */
export const authPagePaths = Object.values(authRoutes);

export type AuthRoute = (typeof authRoutes)[keyof typeof authRoutes];
