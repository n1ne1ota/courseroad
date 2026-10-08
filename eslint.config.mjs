import { defineConfig, globalIgnores } from 'eslint/config';

import prettier from 'eslint-config-prettier/flat';
import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import perfectionist from 'eslint-plugin-perfectionist';
import storybook from 'eslint-plugin-storybook';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import vitestPlugin from 'eslint-plugin-vitest';
import globals from 'globals';

const baseIgnores = [
    '.next/**',
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.env*',
    'public/**',
    '.ui/**',
    'docs/**',
    'next-env.d.ts',
    '*.tsbuildinfo',
    'tsconfig.tsbuildinfo',
    'out/**',
    '.vercel/**',
    'generated/**',
    'storybook-static/**'
];

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([...baseIgnores, 'src/components/custom/iota-ui/docs/code/**']),
    {
        files: ['**/*.{js,jsx,ts,tsx,mjs,mts,cts}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2024
            }
        },
        plugins: {
            perfectionist,
            'unused-imports': unusedImportsPlugin
        },
        settings: {
            react: {
                version: 'detect'
            },
            next: {
                rootDir: import.meta.dirname
            }
        },
        rules: {
            '@next/next/no-assign-module-variable': 'warn',
            '@next/next/no-head-element': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            '@typescript-eslint/no-require-imports': 'warn',
            '@typescript-eslint/no-deprecated': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'object-shorthand': 'warn',
            'prefer-template': 'warn',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports'
                }
            ],
            'react/self-closing-comp': 'warn',
            'react/jsx-pascal-case': 'error',
            'react/jsx-no-duplicate-props': 'error',
            'react/no-unescaped-entities': 'warn',
            'react-hooks/error-boundaries': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/purity': 'warn',
            'react-hooks/refs': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            'jsx-a11y/anchor-has-content': 'warn',
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/interactive-supports-focus': 'warn',
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_'
                }
            ],
            'perfectionist/sort-jsx-props': [
                'warn',
                {
                    type: 'natural',
                    order: 'asc',
                    groups: [
                        'reserved',
                        'styling',
                        'meta',
                        'shorthand',
                        'multiline',
                        'unknown',
                        'data-aria',
                        'callback'
                    ],
                    customGroups: [
                        {
                            groupName: 'reserved',
                            elementNamePattern: '^(key|ref)$'
                        },
                        {
                            groupName: 'styling',
                            elementNamePattern: '^(className|style)$'
                        },
                        {
                            groupName: 'meta',
                            elementNamePattern: '^(id|name|type)$'
                        },
                        {
                            groupName: 'data-aria',
                            elementNamePattern: '^(data-|aria-)'
                        },
                        {
                            groupName: 'callback',
                            elementNamePattern: '^on[A-Z]'
                        },
                        {
                            groupName: 'multiline',
                            modifiers: ['multiline']
                        },
                        {
                            groupName: 'shorthand',
                            modifiers: ['shorthand']
                        }
                    ]
                }
            ],
            'perfectionist/sort-interfaces': 'off',
            'perfectionist/sort-objects': 'off',
            'perfectionist/sort-imports': [
                'warn',
                {
                    type: 'natural',
                    order: 'asc',
                    environment: 'bun',
                    newlinesBetween: 1,
                    fallbackSort: {
                        type: 'type-import-first',
                        order: 'asc'
                    },
                    tsconfig: {
                        rootDir: '.'
                    },
                    groups: [
                        'side-effect',
                        'react',
                        'next',
                        'type-import',
                        'value-builtin',
                        'value-external',
                        'internal-lib',
                        'internal-components',
                        'value-internal',
                        'type-internal',
                        ['value-parent', 'value-sibling', 'value-index'],
                        ['type-parent', 'type-sibling', 'type-index'],
                        'style',
                        'unknown'
                    ],
                    customGroups: [
                        {
                            groupName: 'react',
                            elementNamePattern: ['^react$', '^react-dom']
                        },
                        {
                            groupName: 'next',
                            elementNamePattern: ['^next$', '^next/']
                        },
                        {
                            groupName: 'internal-lib',
                            elementNamePattern: '^(@/lib|@/utils|@/config|@/hooks)'
                        },
                        {
                            groupName: 'internal-components',
                            elementNamePattern: '^@/components'
                        }
                    ]
                }
            ],
            'perfectionist/sort-named-imports': [
                'warn',
                {
                    type: 'natural',
                    order: 'asc'
                }
            ],
            'perfectionist/sort-named-exports': [
                'warn',
                {
                    type: 'natural',
                    order: 'asc'
                }
            ]
        }
    },
    {
        files: ['src/components/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'server-only',
                            message: 'Do not import server-only from client components.'
                        },
                        {
                            name: '@/lib/db/prisma-client',
                            message: 'DB access is not allowed in client components.'
                        },
                        {
                            name: '@/server/email/email-service',
                            message: 'Email service is not allowed in client components.'
                        }
                    ],
                    patterns: [
                        {
                            group: ['@/server/auth/auth', '@/app/api/**'],
                            message: 'Server-side logic cannot be imported directly into client components.'
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', 'tests/**/*.{js,jsx,ts,tsx}'],
        plugins: {
            vitest: vitestPlugin
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2024,
                describe: 'readonly',
                expect: 'readonly',
                it: 'readonly',
                vi: 'readonly'
            }
        },
        rules: {
            'vitest/no-focused-tests': 'error',
            'vitest/no-identical-title': 'error',
            'vitest/valid-expect': 'error',
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        files: ['**/*.config.{js,mjs,ts}', 'scripts/**'],
        rules: {
            'import/no-anonymous-default-export': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'perfectionist/sort-imports': 'off',
            'perfectionist/sort-interfaces': 'off',
            'perfectionist/sort-jsx-props': 'off',
            'perfectionist/sort-named-exports': 'off',
            'perfectionist/sort-named-imports': 'off',
            'perfectionist/sort-objects': 'off'
        }
    },
    {
        files: ['src/actions/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportNamedDeclaration > FunctionDeclaration[async=true]',
                    message:
                        'Raw async functions are not allowed in server actions. Please wrap them using a safe action factory (e.g., createTenantAction) to enforce Zod validation and authorization.'
                },
                {
                    selector:
                        'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression[async=true]',
                    message:
                        'Raw async arrow functions are not allowed in server actions. Please wrap them using a safe action factory (e.g., createTenantAction).'
                }
            ]
        }
    },
    ...storybook.configs['flat/recommended'],
    prettier
]);
