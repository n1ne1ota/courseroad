'use client';

import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';
import { ArrowRight, BookOpen, GraduationCap, Shield, Users } from 'lucide-react';

import { SwissFlagIcon } from '@/assets/icons/swiss-flag-icon';

export function About() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        {/* Hero Section */}
        <div className='mb-16 text-center'>
          <div className='mx-auto mb-4 flex w-fit items-center justify-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-4 py-2 shadow-md ring-1 ring-border/20 backdrop-blur-md transition-all hover:bg-background hover:shadow-lg'>
            <SwissFlagIcon size={20} />
            <span className='text-sm font-semibold tracking-tight text-foreground'>Swiss Made Software</span>
          </div>
          <h1 className='mb-4 text-4xl font-bold tracking-tight'>About Courseroad</h1>
          <p className='text-lg text-muted-foreground'>
            Empowering learners and educators worldwide with a modern, Swiss-engineered learning platform.
          </p>
        </div>

        {/* Mission Section */}
        <section className='mb-16'>
          <h2 className='mb-6 text-2xl font-bold'>Our Mission</h2>
          <p className='text-muted-foreground'>
            We believe that quality education should be accessible to everyone, everywhere. Courseroad combines Swiss
            precision with cutting-edge technology to create a learning platform that helps individuals achieve their
            goals and organizations scale their training programs.
          </p>
        </section>

        {/* Values Section */}
        <section className='mb-16'>
          <h2 className='mb-6 text-2xl font-bold'>Our Values</h2>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
              <Shield className='mb-3 h-8 w-8 text-primary' />
              <h3 className='mb-2 text-lg font-semibold'>Privacy & Security</h3>
              <p className='text-sm text-muted-foreground'>
                Your data stays yours. We comply with GDPR and Swiss data protection laws, ensuring your information is
                secure and private.
              </p>
            </div>
            <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
              <BookOpen className='mb-3 h-8 w-8 text-primary' />
              <h3 className='mb-2 text-lg font-semibold'>Quality First</h3>
              <p className='text-sm text-muted-foreground'>
                Every course is crafted with care. We maintain high standards for content quality and user experience.
              </p>
            </div>
            <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
              <Users className='mb-3 h-8 w-8 text-primary' />
              <h3 className='mb-2 text-lg font-semibold'>Community Driven</h3>
              <p className='text-sm text-muted-foreground'>
                Learning is better together. Our community forums and peer-to-peer features foster collaboration and
                growth.
              </p>
            </div>
            <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
              <GraduationCap className='mb-3 h-8 w-8 text-primary' />
              <h3 className='mb-2 text-lg font-semibold'>Accessibility</h3>
              <p className='text-sm text-muted-foreground'>
                Education should know no barriers. We offer free tiers and scholarships to ensure everyone can learn.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className='mb-16'>
          <h2 className='mb-6 text-2xl font-bold'>Our Story</h2>
          <div className='space-y-4 text-muted-foreground'>
            <p>
              Founded in Switzerland, Courseroad was born from a simple observation: traditional learning management
              systems were outdated, clunky, and failed to leverage modern web capabilities.
            </p>
            <p>
              We set out to build something different – a platform that feels as intuitive as the best consumer apps,
              while delivering the power and flexibility that enterprises need.
            </p>
            <p>
              Today, thousands of learners and educators use Courseroad every day. But we&apos;re just getting started.
              Our commitment to Swiss quality and continuous innovation remains at the heart of everything we do.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className='rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Join the Courseroad Community</h2>
          <p className='mb-6 text-muted-foreground'>
            Start your learning journey today. It&apos;s free to get started.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Button as={Link} color='primary' endContent={<ArrowRight className='h-4 w-4' />} href='/courses'>
              Browse Courses
            </Button>
            <Button as={Link} href='/contact' variant='bordered'>
              Contact Sales
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
