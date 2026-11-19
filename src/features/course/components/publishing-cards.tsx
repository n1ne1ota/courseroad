'use client';

import type { ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea
} from '@courseroad/kurume-ui';

import { CheckCircle2 } from 'lucide-react';

import { groupCurriculumIssues } from '@/features/course/lib/publishing-view';

import type { PublishingCheck, PublishingTarget } from '@/features/course/lib/publishing';
import type { PublishingGroupSummary } from '@/features/course/lib/publishing-view';

type Navigate = (target: PublishingTarget) => Promise<void>;
type CardProps = { group: PublishingGroupSummary; icon: ReactNode; className?: string; onNavigate: Navigate };

const count = (issues: number) => `${issues} open`;

function IssueRow({ check, onNavigate }: { check: PublishingCheck; onNavigate: Navigate }) {
  const label = check.subject || check.label;
  return (
    <li className='flex items-center gap-3 py-2'>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium break-words text-foreground'>{label}</p>
        {check.hint && <p className='text-xs text-muted-foreground'>{check.hint}</p>}
      </div>
      <Button
        type='button'
        size='xs'
        variant='outline'
        aria-label={`Fix ${label}`}
        onClick={() => void onNavigate(check.target)}
      >
        Fix
      </Button>
    </li>
  );
}

function AllClear({ children }: { children: ReactNode }) {
  return (
    <div className='flex h-full min-h-24 flex-col items-center justify-center gap-2 text-center'>
      <CheckCircle2 className='size-6 text-success' aria-hidden='true' />
      <p className='text-sm text-muted-foreground'>{children}</p>
    </div>
  );
}

function Header({ group, icon }: Pick<CardProps, 'group' | 'icon'>) {
  const clear = group.issues.length === 0;
  return (
    <CardHeader>
      <CardTitle icon={icon} iconColor={clear ? 'success' : 'brand'} iconVariant='soft'>
        {group.title}
      </CardTitle>
      <CardDescription>{group.summary}</CardDescription>
      <CardAction>
        <Badge color={clear ? 'success' : 'warning'} size='sm'>
          {clear ? 'Ready' : count(group.issues.length)}
        </Badge>
      </CardAction>
    </CardHeader>
  );
}

/** Details and pricing: a short list of open items, or a quiet all-clear. */
export function PublishingCategoryCard({ group, icon, className, onNavigate }: CardProps) {
  return (
    <Card className={className}>
      <Header group={group} icon={icon} />
      <CardContent>
        {group.issues.length === 0 ? (
          <AllClear>Nothing left to do here.</AllClear>
        ) : (
          <ScrollArea className='max-h-64' fade viewportProps={{ 'aria-label': `${group.title} requirements` }}>
            <ul className='divide-y'>
              {group.issues.map(check => (
                <IssueRow key={check.id} check={check} onNavigate={onNavigate} />
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/** Curriculum: one accordion item per module inside a scroll area, so a long course stays scannable. */
export function PublishingCurriculumCard({ group, icon, className, onNavigate }: CardProps) {
  const modules = groupCurriculumIssues(group.issues);
  return (
    <Card className={className}>
      <Header group={group} icon={icon} />
      <CardContent className='min-h-0 flex-1'>
        {modules.length === 0 ? (
          <AllClear>Every module and lesson is ready.</AllClear>
        ) : (
          <ScrollArea className='max-h-96' fade viewportProps={{ 'aria-label': 'Curriculum requirements' }}>
            <Accordion defaultValue={modules.slice(0, 1).map(module => module.id)} variant='cards'>
              {modules.map(module => {
                const checks = [...module.module, ...module.lessons];
                return (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger>
                      <span className='min-w-0 flex-1 truncate'>{module.title}</span>
                      <Badge color='warning' size='sm'>
                        {checks.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className='divide-y'>
                        {checks.map(check => (
                          <IssueRow key={check.id} check={check} onNavigate={onNavigate} />
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
