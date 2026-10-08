import { DashboardCard } from '@kurume-ui/core';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

export function AdminDashboardCards() {
  return (
    <div className='grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card'>
      <DashboardCard
        badgeIcon={TrendingUpIcon}
        badgeText='+12.5%'
        description='Visitors for the last 6 months'
        title='Total Revenue'
        trendIcon={TrendingUpIcon}
        trendText='Trending up this month'
        value='$1,250.00'
      />
      <DashboardCard
        badgeIcon={TrendingDownIcon}
        badgeText='-20%'
        description='Acquisition needs attention'
        title='New Customers'
        trendIcon={TrendingDownIcon}
        trendText='Down 20% this period'
        value='1,234'
      />
      <DashboardCard
        badgeIcon={TrendingUpIcon}
        badgeText='+12.5%'
        description='Engagement exceed targets'
        title='Active Accounts'
        trendIcon={TrendingUpIcon}
        trendText='Strong user retention'
        value='45,678'
      />
      <DashboardCard
        badgeIcon={TrendingUpIcon}
        badgeText='+4.5%'
        description='Meets growth projections'
        title='Growth Rate'
        trendIcon={TrendingUpIcon}
        trendText='Steady performance'
        value='4.5%'
      />
    </div>
  );
}
