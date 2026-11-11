import 'server-only';

import arcjet, { detectBot, fixedWindow, protectSignup, sensitiveInfo, shield, slidingWindow } from '@arcjet/next';

import { env } from '@/server/config/env';

export default arcjet({
    characteristics: ['fingerprint'],
    key: env.ARCJET_API_KEY,
    rules: [
        shield({
            mode: 'LIVE'
        })
    ]
});

export { detectBot, fixedWindow, protectSignup, sensitiveInfo, shield, slidingWindow };
