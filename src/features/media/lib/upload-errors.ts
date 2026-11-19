/** Shown in a one-line bar, so every message here stays short. */
export const UPLOAD_FAILED = 'Upload failed. Try again.';

/** Messages longer than this are diagnostics, not copy for a person, and are replaced by the generic one. */
const MAX_MESSAGE_LENGTH = 80;

/** Uppy versions expose either an XHR or a response body on upload-error. */
export function uploadErrorMessage(error: { message?: string }, response?: unknown): string {
    if (response && typeof response === 'object') {
        let body: unknown = 'body' in response ? response.body : undefined;
        if ('responseText' in response && typeof response.responseText === 'string') {
            try {
                body = JSON.parse(response.responseText);
            } catch {
                /* A proxy may return HTML instead of JSON. */
            }
        }
        if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') return body.error;
    }
    return error.message || UPLOAD_FAILED;
}

/** Readable text for an HTTP failure; a short message from our own API wins over the generic status copy. */
export function httpStatusMessage(status: number, serverMessage?: string): string {
    if (serverMessage && serverMessage.length <= MAX_MESSAGE_LENGTH) return serverMessage;
    if (status === 401) return 'Session expired. Sign in again.';
    if (status === 403) return 'Not allowed to upload here.';
    if (status === 404) return 'Upload service not found.';
    if (status === 413) return 'File is too large.';
    if (status === 429) return 'Too many uploads. Wait a minute.';
    if (status >= 500) return 'Upload service unavailable.';
    return `Upload failed (${status}).`;
}

/** tus-js-client embeds the status in a long diagnostic string; surface a readable version of it. */
export function tusErrorMessage(error: { message?: string }): string {
    const message = error.message ?? '';
    const status = /response code: (\d{3})/.exec(message)?.[1];
    if (status) return httpStatusMessage(Number(status));
    if (/network error|failed to fetch/i.test(message)) return 'Connection lost. Try again.';
    return message && message.length <= MAX_MESSAGE_LENGTH ? message : UPLOAD_FAILED;
}
