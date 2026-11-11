import type { Route } from 'next';

import { routes } from '@/lib/routes';

export type AuthFlow = 'signIn' | 'signUp' | 'otp' | 'resetPassword';
export type UserRole = 'admin' | 'staff' | 'creator' | 'learner';

/**
 * Return the correct path for an auth action based on desired UI mode.
 */
export function getAuthPath(flow: AuthFlow): string {
    switch (flow) {
        case 'signIn':
            return routes.signIn;
        case 'signUp':
            return routes.signUp;
        case 'otp':
            return routes.otp;
        case 'resetPassword':
            return routes.resetPassword;
        default:
            return routes.signIn;
    }
}

/**
 * Get the dashboard path based on user role
 * @param role - The user's role
 * @returns The appropriate dashboard path as Route type
 */
export function getDashboardPath(role?: UserRole): Route {
    switch (role) {
        case 'admin':
            return routes.adminDashboard as Route;
        case 'staff':
            return routes.staffDashboard as Route;
        case 'creator':
        case 'learner':
        default:
            return routes.selectOrganization as Route;
    }
}
