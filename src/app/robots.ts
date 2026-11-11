import type { MetadataRoute } from 'next';

import { globalData } from '@/lib/config/data';
import { routes } from '@/lib/routes';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { allow: '/', userAgent: '*' },
            {
                disallow: [
                    routes.signIn,
                    routes.signUp,
                    routes.otp,
                    routes.resetPassword,
                    routes.selectOrganization,
                    routes.adminDashboard,
                    '/organization/'
                ],
                userAgent: '*'
            }
        ],
        sitemap: `${globalData.url}/sitemap.xml`
    };
}
