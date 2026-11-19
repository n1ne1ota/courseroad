import type { JSX, ReactNode } from 'react';

import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

/** Sidebar and header for every admin dashboard page; mounted once per segment instead of once per page. */
export default function AdminDashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  return <DashboardPlatformLayout role='admin'>{children}</DashboardPlatformLayout>;
}
