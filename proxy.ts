import { authMiddleware } from '@/server/proxy/auth-routing';
export const proxy = authMiddleware;
export const config = { matcher: ['/((?!api|_next/static|_next/image|_next/webpack-hmr|_next/hmr|favicon.ico).*)'] };
