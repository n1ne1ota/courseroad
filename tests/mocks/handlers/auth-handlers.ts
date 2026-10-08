import { http, HttpResponse } from 'msw';

export const authHandlers = [
    // Mock session endpoint
    http.get('/api/auth/session', () => {
        return HttpResponse.json({
            data: {
                user: {
                    email: 'test@example.com',
                    id: '1',
                    name: 'Test User'
                }
            }
        });
    }),

    // Mock sign in endpoint
    http.post('/api/auth/sign-in', () => {
        return HttpResponse.json({ success: true });
    }),

    // Mock sign up endpoint
    http.post('/api/auth/sign-up', () => {
        return HttpResponse.json({ success: true });
    })
];
