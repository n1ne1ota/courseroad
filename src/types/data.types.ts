import type { Route } from 'next';

import type { LucideIcon } from 'lucide-react';

// Global data types
export interface GlobalData {
    description: string;
    name: string;
    url: Route;
}

// Header data types
export interface HeaderData {
    name: string;
    url: Route;
}

// Dashboard data types
export interface DashboardData {
    documents: NavItems[];
    navMain: NavItems[];
    navSecondary: NavItems[];
}

export interface NavItems {
    icon: LucideIcon;
    isActive?: boolean;
    title: string;
    url: Route;
}
