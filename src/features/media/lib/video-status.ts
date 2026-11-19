/** Encode state we persist for a video. Matches the `VideoStatus` enum in the course schema. */
export type StreamVideoStatus = 'Processing' | 'Ready' | 'Failed';

/**
 * Bunny's webhook `Status` codes: 0 Queued, 1 Processing, 2 Encoding, 3 Finished, 4 ResolutionFinished,
 * 5 Failed, 6 PresignedUploadStarted, 7 PresignedUploadFinished, 8 PresignedUploadFailed.
 */
export function fromWebhookStatus(status: number): StreamVideoStatus {
    switch (status) {
        case 3:
            return 'Ready';
        case 5:
        case 8:
            return 'Failed';
        default:
            return 'Processing';
    }
}

/**
 * Bunny's `GET /videos/{id}` `status` codes. These differ from the webhook codes: 0 Created, 1 Uploaded,
 * 2 Processing, 3 Transcoding, 4 Finished, 5 Error, 6 UploadFailed, 7 JitSegmenting, 8 JitPlaylistsCreated.
 */
export function fromApiStatus(status: number): StreamVideoStatus {
    switch (status) {
        case 4:
        case 8:
            return 'Ready';
        case 5:
        case 6:
            return 'Failed';
        default:
            return 'Processing';
    }
}
