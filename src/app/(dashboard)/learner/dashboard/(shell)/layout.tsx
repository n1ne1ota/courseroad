import type { JSX, ReactNode } from 'react';

import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

/**
 * Sidebar and header for the learner dashboard pages. A segment layout stays mounted across navigation,
 * so the shell does not remount or flash a skeleton between pages. The `(shell)` group keeps the
 * full-screen `learn/` routes outside it.
 */
export default function LearnerDashboardShellLayout({ children }: { children: ReactNode }): JSX.Element {
  return <DashboardPlatformLayout role='learner'>{children}</DashboardPlatformLayout>;
}
