/**
 * Root routing barrel file.
 */
export * from './public';
export * from './auth';
export * from './protected';
export * from './api';
export * from './org';

import { apiRoutes } from './api';
import { authRoutes } from './auth';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

/**
 * All routes combined for easy access
 */
export const routes = {
    ...publicRoutes,
    ...authRoutes,
    ...protectedRoutes,
    ...apiRoutes
} as const;

export type AppRoute =
    | (typeof publicRoutes)[keyof typeof publicRoutes]
    | (typeof authRoutes)[keyof typeof authRoutes]
    | (typeof protectedRoutes)[keyof typeof protectedRoutes]
    | (typeof apiRoutes)[keyof typeof apiRoutes];
