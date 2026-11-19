import Link from 'next/link';

import { Button, Card, Separator } from '@courseroad/iota-ui';

import { ArrowRight, BookOpen, GraduationCap, Shield, Users } from 'lucide-react';

import { PublicPageHeader, PublicPageShell } from '@/components/layout/public-page-shell';

const VALUES = [
  {
    description:
      'Your data stays yours. We comply with GDPR and Swiss data protection laws, ensuring your information is secure and private.',
    icon: Shield,
    title: 'Privacy & Security'
  },
  {
    description:
      'Every course is crafted with care. We maintain high standards for content quality and user experience.',
    icon: BookOpen,
    title: 'Quality First'
  },
  {
    description:
      'Learning is better together. Our community forums and peer-to-peer features foster collaboration and growth.',
    icon: Users,
    title: 'Community Driven'
  },
  {
    description:
      'Education should know no barriers. We offer free tiers and scholarships to ensure everyone can learn.',
    icon: GraduationCap,
    title: 'Accessibility'
  }
] as const;

export function About() {
  return (
    <PublicPageShell>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-12'>
        <PublicPageHeader
          align='center'
          description='Empowering learners and educators worldwide with a modern, Swiss-engineered learning platform.'
          eyebrow='About'
          title='About Courseroad.'
        />

        <Separator />

        {/* Mission Section */}
        <section className='flex flex-col gap-4'>
          <h2 className='text-2xl font-medium tracking-tight'>Our Mission</h2>
          <p className='leading-relaxed text-muted-foreground'>
            We believe that quality education should be accessible to everyone, everywhere. Courseroad combines Swiss
            precision with cutting-edge technology to create a learning platform that helps individuals achieve their
            goals and organizations scale their training programs.
          </p>
        </section>

        {/* Values Section */}
        <section className='flex flex-col gap-6'>
          <h2 className='text-2xl font-medium tracking-tight'>Our Values</h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {VALUES.map(value => {
              const IconComponent = value.icon;
              return (
                <Card key={value.title} className='gap-3 p-6' shadow='sm' variant='frosted-glass'>
                  <IconComponent className='size-7 text-brand' />
                  <h3 className='text-lg font-semibold'>{value.title}</h3>
                  <p className='text-sm leading-relaxed text-muted-foreground'>{value.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Story Section */}
        <section className='flex flex-col gap-4'>
          <h2 className='text-2xl font-medium tracking-tight'>Our Story</h2>
          <div className='space-y-4 leading-relaxed text-muted-foreground'>
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
        <Card className='items-center gap-4 p-8 text-center sm:p-10' shadow='sm' variant='frosted-glass'>
          <h2 className='text-2xl font-medium tracking-tight'>Join the Courseroad Community</h2>
          <p className='max-w-lg text-muted-foreground'>
            Start your learning journey today. It&apos;s free to get started.
          </p>
          <div className='mt-2 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button color='brand' endContent={<ArrowRight className='size-4' />} render={<Link href='/courses' />}>
              Browse Courses
            </Button>
            <Button render={<Link href='/contact' />} variant='outline'>
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </PublicPageShell>
  );
}
