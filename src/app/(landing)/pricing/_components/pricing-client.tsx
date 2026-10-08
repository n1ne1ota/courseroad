'use client';

import { Fragment, useState } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Separator,
  Spacer,
  Tabs,
  Tooltip
} from '@courseroad/iota-ui';
import { cn } from '@courseroad/iota-ui/utils/cn';
import { Check, Info, X } from 'lucide-react';

import { frequencies, tiers } from '../pricing-tiers';
import features from '../pricing-tiers-features';
import { FrequencyEnum } from '../pricing-types';

import type { Frequency } from '../pricing-types';

export function PricingClient() {
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>(frequencies[0] as Frequency);

  const onFrequencyChange = (selectedKey: string) => {
    const frequencyIndex = frequencies.findIndex(f => f.key === selectedKey);

    if (frequencyIndex > -1) setSelectedFrequency(frequencies[frequencyIndex] as Frequency);
  };

  return (
    <div className='relative mx-auto flex max-w-7xl flex-col items-center py-24'>
      <div className='z-10 flex max-w-xl flex-col text-center'>
        <h2 className='leading-7 font-medium text-primary'>Pricing</h2>
        <h1 className='text-4xl font-medium tracking-tight'>Compare plans & features.</h1>
        <Spacer y={4} />
        <h2 className='text-large text-muted-foreground'>Choose the plan that fits your learning or teaching needs.</h2>
      </div>
      <Spacer y={8} />

      <Tabs
        className='bg-default-100/70 rounded-full'
        options={[
          { label: 'Pay Monthly', value: FrequencyEnum.Monthly as string },
          {
            ariaLabel: 'Pay Yearly',
            label: (
              <div className='flex items-center gap-2 pr-0.5'>
                <p>Pay Yearly</p>
                <Chip color='primary' variant='flat'>
                  Save ~20%
                </Chip>
              </div>
            ),
            value: FrequencyEnum.Yearly as string
          }
        ]}
        activeTabClassName='bg-background dark:bg-default-200/30'
        tabClassName='data-[hover-unselected=true]:opacity-90'
        value={selectedFrequency.key as string}
        onValueChange={onFrequencyChange}
      />

      <Spacer y={12} />

      {/* Grid ---> "xs" to "lg" */}
      <div className='z-10 grid w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:hidden'>
        {tiers.map(tier => (
          <Card
            key={tier.key}
            className={cn('border-small border-default-600/30 dark:bg-default-100/20 bg-background/60 p-3', {
              '!border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.5)]': tier.mostPopular
            })}
            shadow='md'
          >
            {tier.mostPopular ? (
              <Chip className='absolute top-4 right-4' color='primary' variant='flat'>
                Most Popular
              </Chip>
            ) : null}
            <CardHeader className='flex flex-col items-start gap-2 pb-6'>
              <h2 className='text-large font-medium'>{tier.title}</h2>
              <p className='text-medium text-muted-foreground'>{tier.description}</p>
            </CardHeader>
            <Separator />
            <CardBody className='gap-8'>
              <p className='flex items-baseline gap-1 pt-2'>
                <span className='to-foreground-600 inline bg-gradient-to-br from-foreground bg-clip-text text-4xl leading-7 font-semibold tracking-tight text-transparent'>
                  {typeof tier.price === 'string' ? tier.price : tier.price[selectedFrequency.key]}
                </span>
                {typeof tier.price !== 'string' ? (
                  <span className='text-default-400 text-sm font-medium'>
                    {tier.priceSuffix
                      ? `/${tier.priceSuffix}/${selectedFrequency.priceSuffix}`
                      : `/${selectedFrequency.priceSuffix}`}
                  </span>
                ) : null}
              </p>
              <ul className='flex flex-col gap-2'>
                {tier.features?.map(feature => (
                  <li key={feature} className='flex items-center gap-2'>
                    <Check className='text-primary' size={24} />
                    <p className='text-muted-foreground'>{feature}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              <Button
                fullWidth
                color={tier.buttonColor || 'primary'}
                render={<Link href={tier.href as Route} />}
                variant={tier.buttonVariant || 'solid'}
              >
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Table ---> lg */}
      <div className='isolate z-10 hidden h-full w-full px-8 lg:block'>
        <div className='relative -mx-8 h-full'>
          <div className='absolute inset-x-4 inset-y-0 z-[-1]'>
            {tiers.map((tier, index) => (
              <div
                key={tier.key}
                className='absolute inset-y-0 flex w-1/4 px-1'
                style={{ left: `${(index + 1) * 25}%` }}
                aria-hidden='true'
              >
                <div
                  className={cn(
                    'rounded-medium border-small h-full w-full bg-background/60 backdrop-blur-md backdrop-saturate-150',
                    tier.mostPopular
                      ? 'dark:bg-default-100/50 border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.5)]'
                      : 'border-default-600/30 dark:bg-default-100/20'
                  )}
                />
              </div>
            ))}
          </div>
          <table className='w-full table-fixed border-separate border-spacing-x-4 text-left'>
            <caption className='sr-only'>Pricing plan comparison</caption>
            <colgroup>
              {Array.from({ length: tiers.length + 1 }).map((_, index) => (
                <col key={index} className='w-1/4' />
              ))}
            </colgroup>
            <thead className='relative z-10'>
              <tr>
                <td />
                {tiers.map(tier => (
                  <th key={tier.key} className='relative px-6 pt-6 xl:px-8 xl:pt-8' scope='col'>
                    {tier.mostPopular ? (
                      <Chip className='absolute top-2 right-2' color='primary' variant='flat'>
                        Most Popular
                      </Chip>
                    ) : null}
                    <div className='text-large relative font-medium text-foreground'>{tier.title}</div>
                  </th>
                ))}
              </tr>
              <tr>
                <th scope='row'>
                  <span className='sr-only'>Price</span>
                </th>
                {tiers.map(tier => (
                  <td key={tier.key} className='relative px-6 py-4 xl:px-8'>
                    <div className='flex items-baseline gap-1 text-foreground'>
                      <span className='to-foreground-600 inline bg-gradient-to-br from-foreground bg-clip-text text-4xl leading-8 font-semibold tracking-tight text-transparent'>
                        {typeof tier.price === 'string' ? tier.price : tier.price[selectedFrequency.key]}
                      </span>
                      {tier.price !== '$0' && (
                        <span className='text-sm font-medium text-muted-foreground'>
                          {tier.priceSuffix
                            ? `/${tier.priceSuffix}/${selectedFrequency.priceSuffix}`
                            : `/${selectedFrequency.priceSuffix}`}
                        </span>
                      )}
                    </div>
                    <Button
                      className={cn('mt-6', {
                        'shadow-default-500/50 font-medium shadow-sm': tier.mostPopular
                      })}
                      fullWidth
                      color={tier.buttonColor || 'primary'}
                      render={<Link href={tier.href as Route} />}
                      variant={tier.buttonVariant || 'solid'}
                    >
                      {tier.buttonText}
                    </Button>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feat, featIndex) => (
                <Fragment key={feat.title}>
                  <tr>
                    <th
                      className={cn('text-large relative pt-12 pb-4 font-semibold text-foreground', {
                        'pt-16': featIndex === 0
                      })}
                      colSpan={1}
                      scope='colgroup'
                    >
                      {feat.title}
                      <div className='bg-default-600/20 absolute -right-4 bottom-0 left-0 h-px' />
                    </th>
                    {tiers.map((tier, index) => (
                      <td key={tier.key} className='relative py-4'>
                        <div
                          className={cn(
                            'bg-default-600/20 absolute bottom-0 left-0 h-px',
                            index === tiers.length - 1 ? 'right-1' : '-right-4'
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                  {feat.items.map(tierFeature => (
                    <tr key={tierFeature.title}>
                      <th className='text-medium text-default-700 py-4 font-normal' scope='row'>
                        {tierFeature.helpText ? (
                          <div className='flex items-center gap-1'>
                            <span>{tierFeature.title}</span>
                            <Tooltip
                              className='max-w-[240px]'
                              color='foreground'
                              content={tierFeature.helpText}
                              placement='right'
                            >
                              <Info className='text-muted-foreground' size={20} />
                            </Tooltip>
                          </div>
                        ) : (
                          tierFeature.title
                        )}
                      </th>

                      {tiers.map(tier => {
                        return (
                          <td key={tier.key} className='relative px-6 py-4 xl:px-8'>
                            {typeof tierFeature.tiers[tier.key] === 'string' ? (
                              <div className='text-medium text-center text-muted-foreground'>
                                {tierFeature.tiers[tier.key]}
                              </div>
                            ) : (
                              <>
                                {tierFeature.tiers[tier.key] === true ? (
                                  <Check className='mx-auto text-primary' size={24} />
                                ) : (
                                  <X className='text-default-400 mx-auto' size={24} />
                                )}

                                <span className='sr-only'>
                                  {tierFeature.tiers[tier.key] === true ? 'Included' : 'Not included'}
                                  &nbsp;in&nbsp;{tier.title}
                                </span>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Spacer y={12} />
      <div className='relative z-10 flex py-2'>
        <p className='text-default-400'>
          Have more questions?&nbsp;
          <Link className='text-foreground hover:underline' href='/contact'>
            Contact Us
          </Link>
        </p>
      </div>
    </div>
  );
}
