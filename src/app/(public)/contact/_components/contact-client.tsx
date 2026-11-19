import Link from 'next/link';

import { Button, Card } from '@courseroad/iota-ui';

import { Copyright, ExternalLink, Mail, MessageSquare, Shield } from 'lucide-react';

import { PublicPageHeader, PublicPageShell } from '@/components/layout/public-page-shell';

const INQUIRY_CHANNELS = [
  {
    description: 'Questions about our platform, pricing, or features.',
    email: 'hello@courseroad.com',
    icon: Mail,
    title: 'General Inquiries'
  },
  {
    description: 'Having issues? Our support team is here to help.',
    email: 'support@courseroad.com',
    icon: MessageSquare,
    title: 'Technical Support'
  },
  {
    description: 'Business inquiries, resellers, and enterprise solutions.',
    email: 'partners@courseroad.com',
    icon: Shield,
    title: 'Partnerships'
  }
] as const;

const DMCA_REQUIREMENTS = [
  'Your name, address, phone, and email',
  'Description of the copyrighted work',
  'Location of the infringing material',
  'A statement of good faith belief',
  'A statement of accuracy under penalty of perjury',
  'Your physical or electronic signature'
] as const;

export function ContactClient() {
  return (
    <PublicPageShell>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-12'>
        <PublicPageHeader
          align='center'
          description="We're here to help. Choose the best way to reach us based on your inquiry."
          eyebrow='Contact'
          title='Contact Us.'
        />

        {/* Contact Options */}
        <div className='grid gap-6 md:grid-cols-3'>
          {INQUIRY_CHANNELS.map(channel => {
            const IconComponent = channel.icon;
            return (
              <Card key={channel.email} className='justify-between gap-4 p-6' shadow='sm' variant='frosted-glass'>
                <div className='flex flex-col gap-2'>
                  <IconComponent className='mb-1 size-7 text-brand' />
                  <h2 className='text-lg font-semibold'>{channel.title}</h2>
                  <p className='text-sm leading-relaxed text-muted-foreground'>{channel.description}</p>
                </div>
                <div>
                  <Button as='a' href={`mailto:${channel.email}`} size='sm' variant='secondary'>
                    {channel.email}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* DMCA Section */}
        <Card className='p-6 sm:p-8' shadow='sm' variant='frosted-glass'>
          <div className='flex items-start gap-4'>
            <Copyright className='mt-1 size-6 shrink-0 text-brand' />
            <div>
              <h2 className='mb-4 text-2xl font-medium tracking-tight'>DMCA &amp; Copyright</h2>
              <p className='mb-4 leading-relaxed text-muted-foreground'>
                We take intellectual property rights seriously. If you believe your copyrighted work has been infringed
                on Courseroad, please send a DMCA notice to our designated agent.
              </p>
              <p className='mb-3 text-sm text-muted-foreground'>Your DMCA notice should include:</p>
              <ul className='mb-6 list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                {DMCA_REQUIREMENTS.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                as='a'
                endContent={<ExternalLink className='size-4' />}
                href='mailto:dmca@courseroad.com'
                variant='outline'
              >
                Send DMCA Notice
              </Button>
            </div>
          </div>
        </Card>

        {/* Legal Section */}
        <Card className='gap-4 p-6 sm:p-8' shadow='sm' variant='frosted-glass'>
          <h2 className='text-2xl font-medium tracking-tight'>Legal &amp; Privacy</h2>
          <p className='text-muted-foreground'>For privacy concerns, legal requests, or data protection inquiries.</p>
          <div className='flex flex-wrap gap-3 pt-2'>
            <Button
              endContent={<ExternalLink className='size-4' />}
              render={<Link href='/about/privacy-policy' />}
              variant='secondary'
            >
              Privacy Policy
            </Button>
            <Button
              endContent={<ExternalLink className='size-4' />}
              render={<Link href='/about/terms' />}
              variant='secondary'
            >
              Terms of Service
            </Button>
            <Button
              as='a'
              endContent={<Mail className='size-4' />}
              href='mailto:privacy@courseroad.com'
              variant='secondary'
            >
              Data Protection Officer
            </Button>
          </div>
        </Card>

        {/* Response Time */}
        <Card className='items-center gap-2 p-8 text-center' shadow='sm' variant='frosted-glass'>
          <h2 className='text-xl font-medium tracking-tight'>We typically respond within 24–48 hours</h2>
          <p className='text-muted-foreground'>
            Thank you for reaching out. We appreciate your patience and will get back to you as soon as possible.
          </p>
        </Card>
      </div>
    </PublicPageShell>
  );
}
