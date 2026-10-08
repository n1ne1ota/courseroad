'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { Button } from '@courseroad/iota-ui';
import { Award, Eye, Printer, X } from 'lucide-react';

import type { CompletedCourse } from '@/features/course/certificate-types';
export type { CompletedCourse } from '@/features/course/certificate-types';

interface CertificateGridProps {
  courses: CompletedCourse[];
}

export function CertificateGrid({ courses }: CertificateGridProps): JSX.Element {
  const [activeCert, setActiveCert] = useState<CompletedCourse | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (courses.length === 0) {
    return (
      <div className='border-default-200/60 bg-content2/20 flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center backdrop-blur-md'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
          <Award className='size-8' />
        </div>
        <h4 className='mt-5 text-xl font-bold text-foreground'>No credentials earned yet</h4>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
          Complete any enrolled course 100% to earn a verified certificate of completion!
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {courses.map(course => {
          const displayDate = course.completedAt
            ? new Date(course.completedAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : new Date().toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

          return (
            <div
              key={course.id}
              className='group border-default-200/50 relative overflow-hidden rounded-2xl border bg-background/40 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
            >
              {/* Decorative Ribbon Icon */}
              <div className='mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110'>
                <Award className='size-6' />
              </div>

              <h4 className='line-clamp-2 min-h-[3rem] text-base font-bold text-foreground'>{course.title}</h4>
              <p className='mt-2 text-xs text-muted-foreground'>Completed on {displayDate}</p>

              <div className='mt-6 flex gap-2'>
                <Button className='flex-1 rounded-xl' color='primary' onPress={() => setActiveCert(course)}>
                  <Eye className='mr-1.5 size-4' />
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal / View Overlay */}
      {activeCert && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md print:absolute print:inset-0 print:z-0 print:bg-white print:p-0 print:backdrop-blur-none'>
          <div className='border-default-200 relative flex w-full max-w-4xl flex-col rounded-3xl border bg-background shadow-2xl print:border-none print:bg-white print:shadow-none'>
            {/* Modal Header (Hidden during print) */}
            <div className='flex items-center justify-between border-b px-6 py-4 print:hidden'>
              <h3 className='text-lg font-bold'>Certificate of Completion</h3>
              <div className='flex gap-2'>
                <Button className='rounded-xl' color='primary' onPress={handlePrint}>
                  <Printer className='mr-1.5 size-4' />
                  Print / Save PDF
                </Button>
                <Button className='min-w-0 rounded-xl p-2' color='secondary' onPress={() => setActiveCert(null)}>
                  <X className='size-5' />
                </Button>
              </div>
            </div>

            {/* Certificate Body */}
            <div className='p-8 sm:p-12 print:m-0 print:p-0'>
              <div className='bg-content1/20 relative border-[10px] border-double border-primary/30 p-12 text-center print:border-primary print:bg-white'>
                {/* Decorative corners */}
                <div className='absolute top-3 left-3 size-8 border-t-2 border-l-2 border-primary/40 print:border-primary' />
                <div className='absolute top-3 right-3 size-8 border-t-2 border-r-2 border-primary/40 print:border-primary' />
                <div className='absolute bottom-3 left-3 size-8 border-b-2 border-l-2 border-primary/40 print:border-primary' />
                <div className='absolute right-3 bottom-3 size-8 border-r-2 border-b-2 border-primary/40 print:border-primary' />

                {/* Logo & Subtitle */}
                <div className='flex flex-col items-center gap-1'>
                  <div className='text-xs font-bold tracking-[0.25em] text-primary uppercase'>Courseroad Academy</div>
                  <div className='my-1 h-[1px] w-12 bg-primary/40' />
                </div>

                <h1 className='mt-8 font-serif text-3xl font-extrabold tracking-wide text-foreground sm:text-5xl print:text-black'>
                  Certificate of Completion
                </h1>
                <p className='mt-4 text-sm text-muted-foreground italic print:text-gray-600'>
                  This is proudly presented to
                </p>

                <h2 className='border-default-200/50 mt-6 border-b pb-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-4xl print:border-black print:text-black'>
                  {activeCert.learnerName}
                </h2>

                <p className='mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground print:text-gray-600'>
                  for successfully completing all lessons, quizzes, and project milestones in the course
                </p>

                <h3 className='mt-4 text-xl font-extrabold text-primary sm:text-2xl print:text-black'>
                  {activeCert.title}
                </h3>

                <div className='border-default-200/50 mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row print:border-black'>
                  <div className='flex flex-col items-center sm:items-start'>
                    <span className='text-[10px] tracking-wider text-muted-foreground uppercase'>Issue Date</span>
                    <span className='text-sm font-semibold text-foreground print:text-black'>
                      {activeCert.completedAt
                        ? new Date(activeCert.completedAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : new Date().toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                    </span>
                  </div>

                  {/* Golden seal representation */}
                  <div className='relative flex size-16 shrink-0 items-center justify-center rounded-full border border-warning/40 bg-warning/5 print:border-yellow-600'>
                    <Award className='size-8 text-warning print:text-yellow-600' />
                  </div>

                  <div className='flex flex-col items-center sm:items-end'>
                    <span className='text-[10px] tracking-wider text-muted-foreground uppercase'>Verification ID</span>
                    <span className='font-mono text-xs text-foreground print:text-black'>
                      CR-{activeCert.id.substring(0, 8).toUpperCase()}-{activeCert.id.substring(24, 32).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS to handle hide/show on print */}
      <style global jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:absolute,
          .print\\:absolute * {
            visibility: visible;
          }
          .print\\:absolute {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
