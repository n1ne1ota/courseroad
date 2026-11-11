/**
 * Public routes that don't require authentication
 */
export const publicRoutes = {
    about: '/about',
    blog: '/blog',
    contact: '/contact',
    courses: '/courses',
    home: '/',
    newPassword: '/new-password',
    pricing: '/pricing',
    privacyPolicy: '/about/privacy-policy',
    resetPassword: '/reset-password',
    terms: '/about/terms',
    tryQuiz: '/try-quiz'
} as const;

/**
 * Helper to get all public paths as an array
 * Useful for middleware authentication checks
 */
export const publicPagePaths = Object.values(publicRoutes);

export type PublicRoute = (typeof publicRoutes)[keyof typeof publicRoutes];
