import { http, HttpResponse } from 'msw';

export const storageHandlers = [
    // Mock image upload to Bunny storage
    http.post('/api/storage/images', () => {
        return HttpResponse.json({
            fileName: 'test-image.png',
            fileSize: 1024,
            path: 'quiz-thumbnails/test-uuid-test-image.png',
            url: 'https://cdn.example.com/quiz-thumbnails/test-uuid-test-image.png'
        });
    })
];
