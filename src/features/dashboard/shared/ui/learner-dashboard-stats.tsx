import type { JSX } from 'react';

import { BookOpen, CheckCircle, GraduationCap } from 'lucide-react';

interface LearnerDashboardStatsProps {
  completedCount: number;
  enrolledCount: number;
  inProgressCount: number;
}

export function LearnerDashboardStats({
  completedCount,
  enrolledCount,
  inProgressCount
}: LearnerDashboardStatsProps): JSX.Element {
  const statsList = [
    {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: <GraduationCap className='size-5 text-primary' />,
      title: 'Enrolled Courses',
      value: enrolledCount
    },
    {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: <BookOpen className='size-5 text-warning' />,
      title: 'In Progress',
      value: inProgressCount
    },
    {
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: <CheckCircle className='size-5 text-success' />,
      title: 'Completed',
      value: completedCount
    }
  ];

  return (
    <div className='grid animate-in grid-cols-1 gap-4 duration-500 fade-in slide-in-from-bottom-4 sm:grid-cols-2 lg:grid-cols-3'>
      {statsList.map((stat, i) => (
        <div
          key={i}
          className='border-default-200/50 hover:border-default-300 relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-background/50 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:scale-[1.02]'
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
        >
          {/* Subtle gradient blob background for each card */}
          <div className={`absolute -top-4 -right-4 size-24 rounded-full opacity-20 blur-2xl ${stat.bg}`} />

          <div
            className={`flex size-14 items-center justify-center rounded-2xl border ${stat.border} ${stat.bg} shadow-inner`}
          >
            {stat.icon}
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>{stat.title}</p>
            <p className='text-3xl font-bold tracking-tight text-foreground'>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
