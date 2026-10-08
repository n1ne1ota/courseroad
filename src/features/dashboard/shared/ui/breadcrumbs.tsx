'use client';

import type { JSX } from 'react';
import { Fragment } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import * as core from '@courseroad/kurume-ui';
import { Home } from 'lucide-react';

const SEGMENT_MAPPINGS: Record<string, string> = {
  admin: 'Admin',
  analytics: 'Analytics',
  billing: 'Billing',
  certificates: 'Certificates',
  courses: 'Courses',
  creator: 'Creator',
  creators: 'Creators',
  dashboard: 'Dashboard',
  earnings: 'Earnings',
  learn: 'Learn',
  learner: 'Learner',
  learners: 'Learners',
  members: 'Members',
  organization: 'Organizations',
  profile: 'Profile',
  quizzes: 'Quizzes',
  settings: 'Settings',
  staff: 'Staff',
  tracking: 'Tracking',
  users: 'Users'
};

function formatSegment(segment: string, index: number, allSegments: string[]): string {
  // Check if it's a UUID pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(segment)) {
    // If parent segment is 'learn' or 'courses', this is a course ID
    const parent = allSegments[index - 1];

    if (parent === 'learn' || parent === 'courses') return 'Course';

    return 'Lesson';
  }

  // Check if it's in the static mapping table
  const mapped = SEGMENT_MAPPINGS[segment.toLowerCase()];

  if (mapped) return mapped;

  // Fallback: replace hyphens with spaces and capitalize
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function Breadcrumbs(): JSX.Element | null {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  return (
    <core.Breadcrumbs>
      <core.BreadcrumbsList>
        <core.BreadcrumbsItem>
          <core.BreadcrumbsLink asChild>
            <Link href={'/dashboard' as Route}>
              <Home className='size-3.5' />
            </Link>
          </core.BreadcrumbsLink>
        </core.BreadcrumbsItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}` as Route;
          const isLast = index === segments.length - 1;
          const label = formatSegment(segment, index, segments);

          // Skip routing dynamic segments like lesson UUIDs directly if they don't have pages
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
          const canLink = !isUuid && !isLast;

          return (
            <Fragment key={href}>
              <core.BreadcrumbsSeparator />
              <core.BreadcrumbsItem>
                {canLink ? (
                  <core.BreadcrumbsLink asChild>
                    <Link className='line-clamp-1' href={href}>
                      {label}
                    </Link>
                  </core.BreadcrumbsLink>
                ) : (
                  <core.BreadcrumbsPage className='line-clamp-1'>{label}</core.BreadcrumbsPage>
                )}
              </core.BreadcrumbsItem>
            </Fragment>
          );
        })}
      </core.BreadcrumbsList>
    </core.Breadcrumbs>
  );
}
