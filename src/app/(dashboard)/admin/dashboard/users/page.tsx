import { Suspense } from 'react';

import type { Metadata } from 'next';

import type { UserRole } from '@/lib/utils/auth-navigation';

import { getUsers } from '@/features/auth/server/users';
import { UserManagementTable } from '@/features/dashboard/platform/admin/user-management-table';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Manage users, assign roles, and view user details.',
  title: 'User Management'
};

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    page?: string;
    sortField?: string;
    sortOrder?: string;
  }>;
}

export default function AdminUsersPage({ searchParams }: UsersPageProps) {
  return (
    <DashboardPlatformLayout role='admin' title='User Management'>
      <div className='flex flex-col gap-6 px-4 lg:px-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>User Management</h1>
          <p className='text-sm text-muted-foreground'>View all users, search by UID or email, and assign roles.</p>
        </div>
        <Suspense fallback={<div className='h-96 w-full animate-pulse rounded-lg bg-muted' />}>
          <UsersContent searchParams={searchParams} />
        </Suspense>
      </div>
    </DashboardPlatformLayout>
  );
}

async function UsersContent({ searchParams }: UsersPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';
  const roleFilter = resolvedParams.role as UserRole | undefined;
  const sortField = resolvedParams.sortField || 'createdAt';
  const sortOrder = (resolvedParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  const result = await getUsers({
    page,
    search,
    sortField,
    sortOrder,
    ...(roleFilter ? { roleFilter } : {})
  });

  const { totalCount, totalPages, users } = result;

  // We map the database output to match the expected interface, stripping unneeded fields.
  const mappedUsers = users.map(user => ({
    createdAt: user.createdAt,
    email: user.email,
    firstName: user.firstName,
    hasPaidActivationFee: user.hasPaidActivationFee,
    id: user.id,
    image: user.image,
    lastName: user.lastName,
    role: user.role as UserRole,
    uid: user.uid,
    username: user.username
  }));

  return (
    <UserManagementTable
      sortField={sortField}
      sortOrder={sortOrder}
      totalCount={totalCount}
      totalPages={totalPages}
      users={mappedUsers}
    />
  );
}
