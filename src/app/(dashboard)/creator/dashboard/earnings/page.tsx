import type { JSX } from 'react';

import { PayoutSetupCard } from '@/features/dashboard/platform/creator/payout-setup-card';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { loadCreatorDashboardEarningsPage } from '@/features/payment/server/loaders/platform-creator-earnings';
import { readForPage } from '@/server/auth/page-access';

export default async function CreatorDashboardEarningsPage(): Promise<JSX.Element> {
  const { user, courseMap, purchases, displayTotalEarnings } = await readForPage(() =>
    loadCreatorDashboardEarningsPage()
  );

  return (
    <DashboardPlatformLayout role='creator' title='Earnings & Payouts'>
      <div className='flex flex-col gap-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>Earnings & Payouts</h2>
          <p className='text-sm text-muted-foreground'>
            Track your direct-to-consumer course sales and configure your Stripe payouts.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Main Earnings Info & History */}
          <div className='flex flex-col gap-8 lg:col-span-2'>
            {/* Quick Earnings Overview Card */}
            <div className='border-default-200/50 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
              <h3 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>Total Earnings</h3>
              <p className='mt-2 text-4xl font-extrabold tracking-tight text-foreground'>{displayTotalEarnings}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Direct payments minus any refunds or service fees. Funds are deposited directly to your connected Stripe
                account.
              </p>
            </div>

            {/* Sales History Table */}
            <div className='border-default-200/50 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
              <h3 className='mb-4 text-lg font-bold text-foreground'>Recent Sales History</h3>

              {purchases.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-sm'>
                    <thead>
                      <tr className='border-default-200/50 border-b font-semibold text-muted-foreground'>
                        <th className='pb-3 font-semibold'>Course</th>
                        <th className='pb-3 font-semibold'>Date</th>
                        <th className='pb-3 text-right font-semibold'>Amount</th>
                      </tr>
                    </thead>
                    <tbody className='divide-default-200/50 divide-y'>
                      {purchases.map(purchase => {
                        const courseTitle = courseMap.get(purchase.courseId) || 'Unknown Course';
                        const displayAmount = (purchase.amount / 100).toLocaleString(undefined, {
                          currency: purchase.currency.toUpperCase(),
                          style: 'currency'
                        });
                        const displayDate = new Date(purchase.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <tr key={purchase.id} className='text-foreground transition-colors hover:bg-muted/10'>
                            <td className='max-w-[200px] truncate py-4 font-medium'>{courseTitle}</td>
                            <td className='py-4 text-muted-foreground'>{displayDate}</td>
                            <td className='py-4 text-right font-semibold text-foreground'>{displayAmount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='py-12 text-center text-sm text-muted-foreground'>
                  No sale transactions recorded yet. Keep building courses and sharing them!
                </div>
              )}
            </div>
          </div>

          {/* Stripe Connect Card Sidebar */}
          <div>
            <PayoutSetupCard
              stripeAccountId={user.stripeAccountId}
              stripeOnboardingComplete={user.stripeOnboardingComplete}
            />
          </div>
        </div>
      </div>
    </DashboardPlatformLayout>
  );
}
