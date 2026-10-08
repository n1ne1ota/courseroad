'use client';

import type { JSX } from 'react';
import { useState, useTransition } from 'react';

import { Button } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@kurume-ui/core';
import { CreditCard, Download, FileText, Loader2 } from 'lucide-react';

import type { PurchaseItem } from '@/features/payment/types';
export type { PurchaseItem } from '@/features/payment/types';

interface BillingSectionProps {
  purchases: PurchaseItem[];
}

export function BillingSection({ purchases }: BillingSectionProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDownloadReceipt = (purchaseId: string, isPlatform: boolean) => {
    setError(null);
    setLoadingId(purchaseId);
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/payments/receipts/${encodeURIComponent(purchaseId)}?isPlatform=${isPlatform}`,
          { cache: 'no-store' }
        );
        const result = await response.json();
        if (response.ok && result.data?.receiptUrl) {
          window.open(result.data.receiptUrl, '_blank');
        } else {
          setError(result.error || 'Failed to retrieve receipt.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching receipt.');
      } finally {
        setLoadingId(null);
      }
    });
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Overview Card */}
      <div className='border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
        <div className='pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/10 blur-3xl' />
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <CreditCard className='size-6' />
            </div>
            <div>
              <h4 className='text-lg font-bold text-foreground'>Payment Method</h4>
              <p className='text-sm text-muted-foreground'>Manage your platform purchases and billing receipts.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Invoice History */}
      <div className='border-default-200/50 overflow-hidden rounded-3xl border bg-background/30 shadow-sm backdrop-blur-md'>
        <div className='border-default-200/50 border-b bg-muted/20 px-6 py-5'>
          <h4 className='text-base font-bold text-foreground'>Billing History</h4>
        </div>

        {purchases.length > 0 ? (
          <div className='w-full overflow-x-auto'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-default-200/50 border-b bg-muted/10 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  <th className='px-6 py-4'>Date</th>
                  <th className='px-6 py-4'>Description</th>
                  <th className='px-6 py-4'>Amount</th>
                  <th className='px-6 py-4'>Status</th>
                  <th className='px-6 py-4 text-right'>Receipt</th>
                </tr>
              </thead>
              <tbody className='divide-default-200/50 divide-y bg-background/10'>
                {purchases.map(purchase => {
                  const displayAmount = (purchase.amount / 100).toFixed(2);
                  const displayDate = new Date(purchase.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={purchase.id} className='transition-colors hover:bg-muted/10'>
                      <td className='px-6 py-4 font-medium whitespace-nowrap text-foreground'>{displayDate}</td>
                      <td className='px-6 py-4 text-foreground'>
                        <div className='flex items-center gap-2'>
                          <FileText className='size-4 text-muted-foreground' />
                          <span>{purchase.description}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 font-semibold whitespace-nowrap text-foreground'>
                        {displayAmount} {purchase.currency.toUpperCase()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success capitalize'>
                          {purchase.status.toLowerCase()}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right whitespace-nowrap'>
                        <Button
                          className='rounded-xl'
                          color='secondary'
                          disabled={isPending && loadingId !== null}
                          size='sm'
                          onPress={() => handleDownloadReceipt(purchase.id, purchase.isPlatform)}
                        >
                          {isPending && loadingId === purchase.id ? (
                            <Loader2 className='size-4 animate-spin' />
                          ) : (
                            <Download className='size-4' />
                          )}
                          <span className='sr-only sm:not-sr-only sm:ml-1'>Invoice</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <FileText className='size-6' />
            </div>
            <h5 className='mt-4 text-base font-bold text-foreground'>No invoices yet</h5>
            <p className='mt-1 text-sm text-muted-foreground'>You haven&apos;t made any purchases on Courseroad yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
