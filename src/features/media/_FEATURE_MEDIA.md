# Media Feature

## Reusable Media API

Sibling features may import `image-upload`, `video-upload`, and `video-player` directly. These components own the
app's upload and playback integration. Schemas and other media internals remain private; compose other product
features in routes or dashboard. The dependency checker enforces this exact component allowlist.
