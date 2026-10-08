'use client';

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@courseroad/kurume-ui';

import { SignalInspector } from './signal-inspector';

interface VisitorHistoryTableProps {
  visitors: {
    firstSeenAt: Date;
    driftCount: number;
    hardwareConcurrency: number | null;
    id: string;
    ipAddress: string | null;
    lastScore: number | null;
    lastSeenAt: Date;
    platform: string | null;
    visitorId: string;
  }[];
}

export function VisitorHistoryTable({ visitors }: VisitorHistoryTableProps) {
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  return (
    <>
      <div className='rounded-md border bg-card text-card-foreground shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Last Match Score</TableHead>
              <TableHead>Drift Count</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className='w-[80px]'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitors.length === 0 ? (
              <TableRow>
                <TableCell className='py-6 text-center text-muted-foreground' colSpan={7}>
                  No visitors recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              visitors.map(visitor => (
                <TableRow key={visitor.id}>
                  <TableCell className='font-mono text-xs font-medium'>{visitor.visitorId.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span>{visitor.platform ?? 'Unknown'}</span>
                      {visitor.hardwareConcurrency && (
                        <span className='text-[10px] text-muted-foreground'>{visitor.hardwareConcurrency} Cores</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-xs'>{visitor.ipAddress ?? 'N/A'}</TableCell>
                  <TableCell>
                    {(() => {
                      const score = visitor.lastScore ?? 0;
                      return (
                        <Badge
                          className={
                            score < 75 && score > 0
                              ? 'border-transparent bg-destructive/20 text-destructive hover:bg-destructive/30'
                              : ''
                          }
                          variant={score >= 75 ? 'secondary' : 'default'}
                        >
                          {score > 0 ? `${score}%` : 'New'}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {visitor.driftCount > 0 ? (
                      <span className='font-medium text-amber-500'>{visitor.driftCount}</span>
                    ) : (
                      <span className='text-muted-foreground'>0</span>
                    )}
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground tabular-nums'>
                    {formatDistanceToNow(new Date(visitor.lastSeenAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      className='-ml-3'
                      size='sm'
                      variant='ghost'
                      onClick={() => setSelectedVisitorId(visitor.visitorId)}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SignalInspector
        isOpen={!!selectedVisitorId}
        visitorId={selectedVisitorId}
        onClose={() => setSelectedVisitorId(null)}
      />
    </>
  );
}
