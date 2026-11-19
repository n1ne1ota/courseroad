import type { Route } from 'next';

import {
    BarChartIcon,
    BookOpenIcon,
    ClipboardListIcon,
    FileIcon,
    FlagIcon,
    FolderIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    MegaphoneIcon,
    SearchIcon,
    SettingsIcon,
    ShieldIcon,
    UsersIcon
} from 'lucide-react';

import { routes } from '@/lib/routes';
import type { OrgRole, OrgRoutes } from '@/lib/routes/org';
import { createOrgRoutes } from '@/lib/routes/org';

import type { DashboardData, GlobalData, NavLink } from '@/types/data.types';

export const globalData: GlobalData = {
    description: 'A modern learning management system',
    name: 'Courseroad',
    url: 'https://courseroad.dev' as Route
};

export const navLinks: NavLink[] = [
    { name: 'Courses', url: routes.courses as Route },
    { name: 'Blog', url: routes.blog },
    { name: 'Pricing', url: routes.pricing },
    { name: 'About', url: routes.about },
    { name: 'Contact', url: routes.contact }
];

export const currencies = [
    {
        label: 'US Dollar',
        value: 'USD'
    },
    {
        label: 'Euro',
        value: 'EUR'
    },
    {
        label: 'British Pound',
        value: 'GBP'
    },
    {
        label: 'Swiss Franc',
        value: 'CHF'
    }
];

// Site Admin dashboard data
export const adminDashboardData: DashboardData = {
    documents: [
        {
            icon: ClipboardListIcon,
            title: 'Reports',
            url: '#' as Route
        },
        {
            icon: FileIcon,
            title: 'Platform Docs',
            url: '#' as Route
        }
    ],
    navMain: [
        {
            icon: LayoutDashboardIcon,
            title: 'Dashboard',
            url: routes.adminDashboard as Route
        },
        {
            icon: UsersIcon,
            title: 'Users',
            url: routes.adminUsers as Route
        },
        {
            icon: UsersIcon,
            title: 'Creators',
            url: routes.adminCreators as Route
        },
        {
            icon: BarChartIcon,
            title: 'Analytics',
            url: routes.adminAnalytics as Route
        },
        {
            icon: ShieldIcon,
            title: 'Tracking',
            url: routes.adminTracking as Route
        },
        {
            icon: SettingsIcon,
            title: 'Settings',
            url: routes.adminSettings as Route
        }
    ],
    navSecondary: []
};

export type PlatformDashboardRole = 'admin' | 'staff' | 'learner' | 'creator';

/** Shared learner presentation; each scope supplies its own destinations. */
function learnerDashboardData(
    destinations: Pick<OrgRoutes, 'announcements' | 'dashboard' | 'courses' | 'quizzes'>
): DashboardData {
    return {
        documents: [
            {
                icon: ClipboardListIcon,
                title: 'Certificates',
                url: '#' as Route
            },
            {
                icon: FileIcon,
                title: 'Resources',
                url: '#' as Route
            }
        ],
        navMain: [
            {
                icon: LayoutDashboardIcon,
                title: 'Dashboard',
                url: destinations.dashboard
            },
            {
                icon: BookOpenIcon,
                title: 'My Courses',
                url: destinations.courses
            },
            {
                icon: ClipboardListIcon,
                title: 'Quizzes',
                url: destinations.quizzes
            },
            {
                icon: MegaphoneIcon,
                title: 'Announcements',
                url: destinations.announcements
            },
            {
                icon: SearchIcon,
                title: 'Browse Courses',
                url: routes.courses as Route
            },
            {
                icon: FolderIcon,
                title: 'Projects',
                url: '#' as Route
            }
        ],
        navSecondary: []
    };
}

function authoringDocuments(): DashboardData['documents'] {
    return [
        {
            icon: ClipboardListIcon,
            title: 'Reports',
            url: '#' as Route
        },
        {
            icon: FileIcon,
            title: 'Resources',
            url: '#' as Route
        }
    ];
}

/** Marketplace and platform administration navigation, without tenant context. */
export function platformDashboardData(role: PlatformDashboardRole = 'learner'): DashboardData {
    if (role === 'admin') return adminDashboardData;
    if (role === 'staff') return staffDashboardData;
    if (role === 'learner') {
        return learnerDashboardData({
            announcements: routes.dashboardAnnouncements as Route,
            dashboard: routes.dashboard as Route,
            courses: routes.courses as Route,
            quizzes: '/quizzes' as Route
        });
    }

    return {
        documents: authoringDocuments(),
        navMain: [
            { icon: LayoutDashboardIcon, title: 'Dashboard', url: routes.creatorDashboard as Route },
            { icon: BookOpenIcon, title: 'My Courses', url: routes.creatorCourses as Route },
            { icon: UsersIcon, title: 'Public Profile', url: routes.creatorProfile as Route },
            { icon: BarChartIcon, title: 'Earnings', url: routes.creatorEarnings as Route },
            { icon: SettingsIcon, title: 'Settings', url: routes.creatorSettings as Route }
        ],
        navSecondary: []
    };
}

/** Organization navigation always derives destinations from the supplied slug. */
export function organizationDashboardData(orgSlug: string, role: OrgRole = 'learner'): DashboardData {
    const orgRoutes = createOrgRoutes(orgSlug, role);
    if (role === 'learner') return learnerDashboardData(orgRoutes);

    return {
        documents: authoringDocuments(),
        navMain: [
            {
                icon: LayoutDashboardIcon,
                title: 'Dashboard',
                url: orgRoutes.dashboard
            },
            ...(role === 'owner' || role === 'manager' || role === 'creator'
                ? [
                      {
                          icon: BookOpenIcon,
                          title: 'Courses',
                          url: orgRoutes.courses
                      }
                  ]
                : []),
            {
                icon: ClipboardListIcon,
                title: 'Quizzes',
                url: orgRoutes.quizzes
            },
            ...(role === 'owner' || role === 'manager' || role === 'instructor'
                ? [
                      {
                          icon: GraduationCapIcon,
                          title: 'Learners',
                          url: orgRoutes.learners
                      }
                  ]
                : []),
            ...(role === 'owner' || role === 'manager'
                ? [
                      {
                          icon: UsersIcon,
                          title: 'Members',
                          url: orgRoutes.members
                      },
                      {
                          icon: MegaphoneIcon,
                          title: 'Announcements',
                          url: orgRoutes.announcements
                      },
                      {
                          icon: BarChartIcon,
                          title: 'Analytics',
                          url: orgRoutes.analytics
                      },
                      {
                          icon: SettingsIcon,
                          title: 'Settings',
                          url: orgRoutes.settings
                      }
                  ]
                : [])
        ],
        navSecondary: []
    };
}

// Staff dashboard data
export const staffDashboardData: DashboardData = {
    documents: [
        {
            icon: ClipboardListIcon,
            title: 'Reports',
            url: '#' as Route
        },
        {
            icon: FileIcon,
            title: 'Guidelines',
            url: '#' as Route
        }
    ],
    navMain: [
        {
            icon: LayoutDashboardIcon,
            title: 'Overview',
            url: routes.staffDashboard as Route
        },
        {
            icon: UsersIcon,
            title: 'Users',
            url: '#' as Route
        },
        {
            icon: ShieldIcon,
            title: 'Moderation',
            url: '#' as Route
        },
        {
            icon: FlagIcon,
            title: 'Reports',
            url: '#' as Route
        },
        {
            icon: BarChartIcon,
            title: 'Analytics',
            url: routes.staffAnalytics as Route
        },
        {
            icon: SettingsIcon,
            title: 'Settings',
            url: routes.staffSettings as Route
        }
    ],
    navSecondary: []
};
