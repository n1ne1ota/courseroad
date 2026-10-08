import { FrequencyEnum, TiersEnum } from './pricing-types';

import type { Frequency, Tier } from './pricing-types';

export const frequencies: Array<Frequency> = [
    { key: FrequencyEnum.Monthly, label: 'Pay Monthly', priceSuffix: 'per month' },
    { key: FrequencyEnum.Yearly, label: 'Pay Yearly', priceSuffix: 'per year' }
];

export const tiers: Array<Tier> = [
    {
        buttonColor: 'default',
        buttonText: 'Get Started',
        buttonVariant: 'flat',
        description: 'Perfect for getting started with free courses.',
        featured: false,
        features: ['Access to free courses', 'Basic progress tracking', 'Community forums', 'Standard support'],
        href: '/select-organization',
        key: TiersEnum.Learner,
        mostPopular: false,
        price: '$0',
        title: 'Learner'
    },
    {
        buttonColor: 'primary',
        buttonText: 'Start Free Trial',
        buttonVariant: 'solid',
        description: 'For serious learners who want unlimited access.',
        featured: false,
        features: [
            'Everything in Free',
            'Unlimited course access',
            'Download for offline',
            'Certificate of completion'
        ],
        href: '/select-organization',
        key: TiersEnum.ProLearner,
        mostPopular: true,
        price: {
            monthly: '$19',
            yearly: '$15'
        },
        title: 'Pro Learner'
    },
    {
        buttonColor: 'default',
        buttonText: 'Apply Now',
        buttonVariant: 'flat',
        description: 'For educators and creators to publish courses.',
        featured: true,
        features: [
            'Everything in Pro Learner',
            'Create unlimited courses',
            'Revenue share (70/30)',
            'Analytics dashboard'
        ],
        href: '/select-organization',
        key: TiersEnum.Creator,
        mostPopular: false,
        price: {
            monthly: '$49',
            yearly: '$39'
        },
        title: 'Creator'
    }
];
