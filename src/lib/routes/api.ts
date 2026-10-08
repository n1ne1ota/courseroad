/**
 * API routes
 */
export const apiRoutes = {
    auth: '/api/auth'
} as const;

export type ApiRoute = (typeof apiRoutes)[keyof typeof apiRoutes];
