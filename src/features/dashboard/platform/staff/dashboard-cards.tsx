import { DashboardCard } from '@kurume-ui/core';
import { AlertTriangleIcon, CheckCircleIcon, FileTextIcon } from 'lucide-react';

export function StaffDashboardCards() {
  return (
    <div className='grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card'>
      <DashboardCard
        badgeIcon={FileTextIcon}
        description='Across all courses'
        title='Content Items'
        trendText='Active published content'
        value='12,450'
      />
      <DashboardCard
        badgeIcon={AlertTriangleIcon}
        description='Approaching SLA limit'
        title='Pending Reviews'
        trendText='Action required soon'
        value='142'
      />
      <DashboardCard
        badgeIcon={AlertTriangleIcon}
        badgeText='High'
        description='User-reported issues'
        title='Flagged Reports'
        trendText='Requires immediate attention'
        value='28'
      />
      <DashboardCard
        badgeIcon={CheckCircleIcon}
        badgeText='Online'
        description='Peak hours approaching'
        title='Active Users Today'
        trendText='Healthy platform traffic'
        value='3,842'
      />
    </div>
  );
}
