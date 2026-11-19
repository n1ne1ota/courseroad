import { TiersEnum } from './pricing-types';

import type { PricingFeatures } from './pricing-comparison-types';

const features: PricingFeatures = [
    {
        items: [
            {
                helpText: 'Access all the free courses available on the platform.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: true,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Free courses access'
            },
            {
                helpText: 'Full access to all premium courses on the platform.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Unlimited course access'
            },
            {
                helpText: 'Download course videos and materials to your device.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Download for offline viewing'
            }
        ],
        title: 'Learning Content'
    },
    {
        items: [
            {
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: true,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Basic progress tracking'
            },
            {
                helpText: 'Receive official certificates when you finish premium courses.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Certificates of completion'
            }
        ],
        title: 'Progress & Certification'
    },
    {
        items: [
            {
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: false
                },
                title: 'Create unlimited courses'
            },
            {
                helpText: 'Keep 70% of the revenue generated from your paid courses.',
                tiers: {
                    [TiersEnum.Creator]: '70/30',
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: false
                },
                title: 'Revenue share'
            },
            {
                helpText: 'Detailed insights into your course performance and learner engagement.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: false
                },
                title: 'Analytics dashboard'
            },
            {
                helpText: 'Add your own logo and brand colors to your course pages.',
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: false,
                    [TiersEnum.ProLearner]: false
                },
                title: 'Custom branding'
            }
        ],
        title: 'Teaching & Creation'
    },
    {
        items: [
            {
                tiers: {
                    [TiersEnum.Creator]: true,
                    [TiersEnum.Learner]: true,
                    [TiersEnum.ProLearner]: true
                },
                title: 'Community forums'
            },
            {
                tiers: {
                    [TiersEnum.Creator]: 'Priority',
                    [TiersEnum.Learner]: 'Standard',
                    [TiersEnum.ProLearner]: 'Priority'
                },
                title: 'Support level'
            }
        ],
        title: 'Support & Community'
    }
];

export default features;
