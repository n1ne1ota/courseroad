import { defineConfig } from '@prisma/config';

try {
    // Preserve optional database-local settings from the former database workspace.
    if (typeof process.loadEnvFile === 'function')
        process.loadEnvFile(new URL('./.env.database.local', import.meta.url));
} catch {
    // Ignore missing database-local settings; inherited environment values retain precedence.
}

try {
    if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch {
    // Ignore missing .env file
}

export default defineConfig({
    datasource: {
        // In Prisma v7, this 'url' is used primarily for migrations/CLI tools.
        // We use the direct (non-pooled) URL to avoid transaction mode issues.
        url: process.env.DIRECT_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
    },
    migrations: {
        path: 'prisma/migrations'
    },
    schema: 'prisma/schema'
});
