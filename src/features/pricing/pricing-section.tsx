import type { Route } from 'next';
import Link from 'next/link';

import { Chip } from '@courseroad/iota-ui';
import type {
  PricingBillingOption,
  PricingFeatureSection,
  PricingPlan,
  PricingPrice
} from '@courseroad/iota-ui/blocks';
import { PricingComparison } from '@courseroad/iota-ui/blocks';

import { PublicPageShell } from '@/components/layout/public-page-shell';

import { frequencies, tiers } from './pricing-tiers';
import features from './pricing-tiers-features';
import { FrequencyEnum } from './pricing-types';

import type { Tier } from './pricing-types';

const billingOptions: PricingBillingOption[] = frequencies.map(frequency =>
  frequency.key === FrequencyEnum.Yearly
    ? {
        ariaLabel: 'Pay Yearly, save about 20%',
        badge: (
          <Chip color='brand' size='sm' variant='solid'>
            Save 33%
          </Chip>
        ),
        label: frequency.label,
        value: frequency.key
      }
    : { label: frequency.label, value: frequency.key }
);

function toPrice(tier: Tier): PricingPlan['price'] {
  if (typeof tier.price === 'string') return { amount: tier.price };

  const price = tier.price;

  return Object.fromEntries(
    frequencies.map((frequency): [string, PricingPrice] => [
      frequency.key,
      {
        amount: price[frequency.key],
        suffix: tier.priceSuffix ? `/${tier.priceSuffix}/${frequency.priceSuffix}` : `/${frequency.priceSuffix}`
      }
    ])
  );
}

const plans: PricingPlan[] = tiers.map(tier => ({
  action: {
    label: tier.buttonText,
    render: <Link href={tier.href as Route} />,
    ...(tier.buttonColor ? { color: tier.buttonColor } : {}),
    ...(tier.buttonVariant ? { variant: tier.buttonVariant } : {})
  },
  id: tier.key,
  price: toPrice(tier),
  title: tier.title,
  ...(tier.mostPopular ? { badge: 'Most Popular', highlighted: true } : {}),
  ...(tier.description ? { description: tier.description } : {}),
  ...(tier.features ? { features: tier.features } : {})
}));

const sections: PricingFeatureSection[] = features.map(section => ({
  items: section.items.map(item => ({
    title: item.title,
    values: item.tiers,
    ...(item.helpText ? { helpText: item.helpText } : {})
  })),
  title: section.title
}));

/**
 * Courseroad pricing: maps the plan and feature data in this feature onto the Iota UI `PricingComparison` block.
 * Static data, so this stays a Server Component; the block itself is the client boundary.
 */
export function PricingSection() {
  return (
    <PublicPageShell framed={false}>
      <PricingComparison
        footer={
          <>
            Have more questions?&nbsp;
            <Link href='/contact'>Contact Us</Link>
          </>
        }
        billingOptions={billingOptions}
        defaultBilling={FrequencyEnum.Monthly}
        description='Choose the plan that fits your learning or teaching needs.'
        eyebrow='Pricing'
        headingLevel={1}
        plans={plans}
        sections={sections}
        title='Compare plans & features.'
      />
    </PublicPageShell>
  );
}
