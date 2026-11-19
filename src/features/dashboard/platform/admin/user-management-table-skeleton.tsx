import type { JSX } from 'react';

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@courseroad/kurume-ui';

import { ArrowUpDownIcon } from 'lucide-react';

const COLUMN_LABELS = ['UID', 'User', 'E-Mail', 'Role', 'Date Joined'] as const;

/** Skeleton for `UserManagementTable`: search and filter toolbar, the table with its real headers, and pagination. */
export function UserManagementTableSkeleton({ rows = 8 }: { rows?: number }): JSX.Element {
  return (
    <div className='flex w-full flex-col justify-start gap-6' aria-hidden='true'>
      <div className='flex flex-col gap-4 px-1 md:flex-row md:items-center md:justify-between'>
        <div className='flex w-full flex-1 items-center gap-2 md:max-w-sm'>
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-10 w-full sm:w-40' />
          <Skeleton className='h-10 w-28 lg:w-48' />
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              <TableHead>
                <div className='flex items-center justify-center px-2'>
                  <Skeleton className='size-4' />
                </div>
              </TableHead>
              {COLUMN_LABELS.map(label => (
                <TableHead key={label}>
                  <span className='flex items-center'>
                    {label}
                    <ArrowUpDownIcon className='ml-1.5 h-3.5 w-3.5 opacity-40' />
                  </span>
                </TableHead>
              ))}
              <TableHead>
                <div className='w-full px-4 text-right'>Actions</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='**:data-[slot=table-cell]:first:w-8'>
            {Array.from({ length: rows }, (_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className='flex items-center justify-center px-2'>
                    <Skeleton className='size-4' />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-10' shape='text' />
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='size-9 shrink-0' shape='circle' />
                    <div className='flex flex-col gap-1.5'>
                      <Skeleton className='h-4 w-28' shape='text' />
                      <Skeleton className='h-3 w-20' shape='text' />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-44' shape='text' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16 rounded-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' shape='text' />
                </TableCell>
                <TableCell>
                  <div className='flex justify-end px-4'>
                    <Skeleton className='h-8 w-8' />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between px-2 pb-4'>
        <Skeleton className='hidden h-4 w-40 lg:block' shape='text' />
        <div className='flex w-full items-center gap-8 lg:w-fit'>
          <Skeleton className='h-4 w-24' shape='text' />
          <div className='ml-auto flex items-center gap-2 lg:ml-0'>
            <Skeleton className='hidden size-8 lg:block' />
            <Skeleton className='size-8' />
            <Skeleton className='size-8' />
            <Skeleton className='hidden size-8 lg:block' />
          </div>
        </div>
      </div>
    </div>
  );
}
