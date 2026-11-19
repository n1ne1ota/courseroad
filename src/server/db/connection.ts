import ws from 'ws';

import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Configure Neon to use the 'ws' package for WebSockets
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

    // In Prisma v7, PrismaNeon takes the PoolConfig directly
    const driver = process.env.DATABASE_ADAPTER ?? 'neon';
    if (driver !== 'neon' && driver !== 'pg') throw new Error('DATABASE_ADAPTER must be neon or pg');
    const configuration = { connectionString: process.env.DATABASE_URL };
    const adapter = driver === 'pg' ? new PrismaPg(configuration) : new PrismaNeon(configuration);

    return new PrismaClient({ adapter });
};

export const prismaClient = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
