'use client';

import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';
import { Copyright, ExternalLink, Mail, MessageSquare, Shield } from 'lucide-react';

import { SwissFlagIcon } from '@/assets/icons/swiss-flag-icon';

export function ContactClient() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <div className='mx-auto mb-4 flex w-fit items-center justify-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-4 py-2 shadow-md ring-1 ring-border/20 backdrop-blur-md transition-all hover:bg-background hover:shadow-lg'>
            <SwissFlagIcon size={20} />
            <span className='text-sm font-semibold tracking-tight text-foreground'>Swiss Made Software</span>
          </div>
          <h1 className='mb-4 text-4xl font-bold tracking-tight'>Contact Us</h1>
          <p className='text-lg text-muted-foreground'>
            We&apos;re here to help. Choose the best way to reach us based on your inquiry.
          </p>
        </div>

        {/* Contact Options */}
        <div className='mb-16 grid gap-6 md:grid-cols-3'>
          {/* General Inquiries */}
          <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
            <Mail className='mb-3 h-8 w-8 text-primary' />
            <h3 className='mb-2 text-lg font-semibold'>General Inquiries</h3>
            <p className='mb-4 text-sm text-muted-foreground'>Questions about our platform, pricing, or features.</p>
            <Button as={Link} href='mailto:hello@courseroad.com' size='sm' variant='flat'>
              hello@courseroad.com
            </Button>
          </div>

          {/* Support */}
          <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
            <MessageSquare className='mb-3 h-8 w-8 text-primary' />
            <h3 className='mb-2 text-lg font-semibold'>Technical Support</h3>
            <p className='mb-4 text-sm text-muted-foreground'>Having issues? Our support team is here to help.</p>
            <Button as={Link} href='mailto:support@courseroad.com' size='sm' variant='flat'>
              support@courseroad.com
            </Button>
          </div>

          {/* Partnerships */}
          <div className='rounded-xl border border-border bg-card p-6 text-card-foreground'>
            <Shield className='mb-3 h-8 w-8 text-primary' />
            <h3 className='mb-2 text-lg font-semibold'>Partnerships</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Business inquiries, resellers, and enterprise solutions.
            </p>
            <Button as={Link} href='mailto:partners@courseroad.com' size='sm' variant='flat'>
              partners@courseroad.com
            </Button>
          </div>
        </div>

        {/* DMCA Section */}
        <section className='mb-16 rounded-xl border border-border bg-card p-8 text-card-foreground'>
          <div className='flex items-start gap-4'>
            <Copyright className='mt-1 h-6 w-6 flex-shrink-0 text-primary' />
            <div>
              <h2 className='mb-4 text-2xl font-bold'>DMCA & Copyright</h2>
              <p className='mb-4 text-muted-foreground'>
                We take intellectual property rights seriously. If you believe your copyrighted work has been infringed
                on Courseroad, please send a DMCA notice to our designated agent.
              </p>
              <p className='mb-4 text-sm text-muted-foreground'>Your DMCA notice should include:</p>
              <ul className='mb-6 list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                <li>Your name, address, phone, and email</li>
                <li>Description of the copyrighted work</li>
                <li>Location of the infringing material</li>
                <li>A statement of good faith belief</li>
                <li>A statement of accuracy under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ul>
              <Button
                as={Link}
                endContent={<ExternalLink className='h-4 w-4' />}
                href='mailto:dmca@courseroad.com'
                variant='bordered'
              >
                Send DMCA Notice
              </Button>
            </div>
          </div>
        </section>

        {/* Legal Section */}
        <section className='mb-16 rounded-xl border border-border bg-card p-8 text-card-foreground'>
          <h2 className='mb-4 text-2xl font-bold'>Legal & Privacy</h2>
          <p className='mb-6 text-muted-foreground'>
            For privacy concerns, legal requests, or data protection inquiries.
          </p>
          <div className='flex flex-wrap gap-4'>
            <Button
              as={Link}
              endContent={<ExternalLink className='h-4 w-4' />}
              href='/about/privacy-policy'
              variant='flat'
            >
              Privacy Policy
            </Button>
            <Button as={Link} endContent={<ExternalLink className='h-4 w-4' />} href='/about/terms' variant='flat'>
              Terms of Service
            </Button>
            <Button
              as={Link}
              endContent={<Mail className='h-4 w-4' />}
              href='mailto:privacy@courseroad.com'
              variant='flat'
            >
              Data Protection Officer
            </Button>
          </div>
        </section>

        {/* Response Time */}
        <section className='rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center'>
          <h2 className='mb-4 text-xl font-bold'>We typically respond within 24-48 hours</h2>
          <p className='text-muted-foreground'>
            Thank you for reaching out. We appreciate your patience and will get back to you as soon as possible.
          </p>
        </section>
      </div>
    </div>
  );
}
