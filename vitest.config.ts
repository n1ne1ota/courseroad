import { fileURLToPath } from 'node:url';
import path from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { configDefaults, defineConfig } from 'vitest/config';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@/features': path.resolve(__dirname, './src/features'),
            '@/layout': path.resolve(__dirname, './src/components/layout'),
            '@': path.resolve(__dirname, './src'),
            tests: path.resolve(__dirname, './tests')
        }
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        // Ensure the .ui/ directory is completely ignored by tests
        exclude: [...configDefaults.exclude, '.ui/**'],
        projects: [
            {
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook')
                    })
                ],
                test: {
                    globals: true,
                    browser: {
                        enabled: true,
                        headless: true,
                        instances: [
                            {
                                browser: 'chromium'
                            }
                        ],
                        provider: playwright({})
                    },
                    name: 'storybook',
                    setupFiles: ['.storybook/vitest.setup.ts']
                }
            }
        ]
    }
});
