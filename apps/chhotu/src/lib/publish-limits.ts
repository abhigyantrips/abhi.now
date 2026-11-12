export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_BASE64 = 4 * Math.ceil(MAX_IMAGE_BYTES / 3);
// JSON escaping can expand 100 KB of Markdown sixfold. Include metadata and alt text too.
export const MAX_PUBLISH_BYTES = MAX_IMAGE_BASE64 + 650_000;
