import type { JSX, ReactNode } from 'react';

import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

/** Sidebar and header for every staff dashboard page; mounted once per segment instead of once per page. */
export default function StaffDashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  return <DashboardPlatformLayout role='staff'>{children}</DashboardPlatformLayout>;
}
