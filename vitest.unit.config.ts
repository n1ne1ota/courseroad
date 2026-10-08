import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@/layout': path.resolve(__dirname, './src/components/layout'),
            '@': path.resolve(__dirname, './src'),
            tests: path.resolve(__dirname, './tests')
        }
    },
    test: {
        server: {
            deps: {
                inline: [/@courseroad\//, 'resend']
            }
        },
        coverage: {
            exclude: ['**/*.stories.{ts,tsx}', '**/*.config.{ts,js}', '**/node_modules/**'],
            provider: 'v8',
            reporter: ['text', 'lcov'],
            thresholds: {
                branches: 60,
                functions: 60,
                lines: 60,
                statements: 60
            }
        },
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}']
    }
});
