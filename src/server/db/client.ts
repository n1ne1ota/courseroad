import 'server-only';
// Next.js entry point. Maintenance scripts use the shared connection directly.
export { prismaClient } from './connection';
