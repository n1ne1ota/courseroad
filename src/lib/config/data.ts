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
    SearchIcon,
    SettingsIcon,
    ShieldIcon,
    UsersIcon
} from 'lucide-react';

import { routes } from '@/lib/routes';
import { createOrgRoutes } from '@/lib/routes/org';

import type { DashboardData, GlobalData, HeaderData } from '@/types/data.types';

export const globalData: GlobalData = {
    description: 'A modern learning management system',
    name: 'Courseroad',
    url: 'https://courseroad.dev' as Route
};

export const headerData: HeaderData[] = [
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

/// Factory for B2B organization dashboard sidebar data, parameterized by org slug and role
export function orgDashboardData(orgSlug?: string, role?: string): DashboardData {
    const userRole = (role || 'learner').toLowerCase();
    const orgRoutes = orgSlug ? createOrgRoutes(orgSlug, userRole) : null;

    if (userRole === 'learner') {
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
                    url: orgRoutes ? orgRoutes.dashboard : (routes.dashboard as Route)
                },
                {
                    icon: BookOpenIcon,
                    title: 'My Courses',
                    url: orgRoutes ? orgRoutes.courses : ('/courses' as Route)
                },
                {
                    icon: ClipboardListIcon,
                    title: 'Quizzes',
                    url: orgRoutes ? orgRoutes.quizzes : ('/quizzes' as Route)
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

    // Owner, Manager, Creator, Instructor roles
    return {
        documents: [
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
        ],
        navMain: orgRoutes
            ? [
                  {
                      icon: LayoutDashboardIcon,
                      title: 'Dashboard',
                      url: orgRoutes.dashboard
                  },
                  ...(userRole === 'owner' || userRole === 'manager' || userRole === 'creator'
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
                  ...(userRole === 'owner' || userRole === 'manager' || userRole === 'instructor'
                      ? [
                            {
                                icon: GraduationCapIcon,
                                title: 'Learners',
                                url: orgRoutes.learners
                            }
                        ]
                      : []),
                  ...(userRole === 'owner' || userRole === 'manager'
                      ? [
                            {
                                icon: UsersIcon,
                                title: 'Members',
                                url: orgRoutes.members
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
              ]
            : [
                  {
                      icon: LayoutDashboardIcon,
                      title: 'Dashboard',
                      url: routes.creatorDashboard as Route
                  },
                  {
                      icon: BookOpenIcon,
                      title: 'My Courses',
                      url: routes.creatorCourses as Route
                  },
                  {
                      icon: UsersIcon,
                      title: 'Public Profile',
                      url: routes.creatorProfile as Route
                  },
                  {
                      icon: BarChartIcon,
                      title: 'Earnings',
                      url: routes.creatorEarnings as Route
                  },
                  {
                      icon: SettingsIcon,
                      title: 'Settings',
                      url: routes.creatorSettings as Route
                  }
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
