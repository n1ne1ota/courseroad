/**
 * Protected routes that require authentication.
 *
 * Org-scoped routes (learner, creator) are no longer statically listed here
 * because they are dynamically constructed via createOrgRoutes(). Only
 * platform-level admin and staff routes remain static.
 */
export const protectedRoutes = {
    // Admin routes
    adminAnalytics: '/admin/dashboard/analytics',
    adminCreators: '/admin/dashboard/creators',
    adminDashboard: '/admin/dashboard',
    adminSettings: '/admin/dashboard/settings',
    adminTracking: '/admin/dashboard/tracking',
    adminUsers: '/admin/dashboard/users',

    // Org-scoped creation
    createOrganization: '/create-organization',

    // B2C Learner Dashboard
    dashboard: '/learner/dashboard',
    dashboardBilling: '/learner/dashboard/billing',
    dashboardCertificates: '/learner/dashboard/certificates',

    // Onboarding
    onboarding: '/onboarding',

    // Org-scoped selector
    selectOrganization: '/select-organization',

    // Staff routes
    staffAnalytics: '/staff/dashboard/analytics',
    staffCourses: '/staff/dashboard/courses',
    staffDashboard: '/staff/dashboard',
    staffSettings: '/staff/dashboard/settings',

    // B2C Creator Dashboard
    creatorCourses: '/creator/dashboard/courses',
    creatorDashboard: '/creator/dashboard',
    creatorEarnings: '/creator/dashboard/earnings',
    creatorProfile: '/creator/dashboard/profile',
    creatorSettings: '/creator/dashboard/settings'
} as const;

export type ProtectedRoute = (typeof protectedRoutes)[keyof typeof protectedRoutes];
