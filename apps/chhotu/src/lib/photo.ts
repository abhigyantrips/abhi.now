import { decode as decodePng } from "fast-png";
import { imageSize } from "image-size";
import jpeg from "jpeg-js";
import { AppError } from "./errors";

import { MAX_IMAGE_BASE64, MAX_IMAGE_BYTES } from "./publish-limits";

export function validatePhoto(value: unknown): { contents: string; extension: "jpg" | "png" } {
	if (!value || typeof value !== "object") throw new AppError(400, "choose a JPEG or PNG photo.");
	const { base64 } = value as { base64?: unknown };
	if (typeof base64 !== "string" || !base64 || base64.length > MAX_IMAGE_BASE64)
		throw new AppError(400, "choose a photo no larger than 10 MiB.");
	if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64))
		throw new AppError(400, "invalid photo encoding.");
	const binary = atob(base64);
	if (btoa(binary) !== base64) throw new AppError(400, "invalid photo encoding.");
	if (binary.length > MAX_IMAGE_BYTES)
		throw new AppError(400, "choose a photo no larger than 10 MiB.");
	try {
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		const { type, width, height } = imageSize(bytes);
		if ((type !== "jpg" && type !== "png") || !width || !height || width * height > 4_000_000)
			throw new Error("unsupported image or dimensions");
		// Decode rather than trusting the filename, MIME type, or signature alone.
		if (type === "jpg")
			jpeg.decode(bytes, {
				useTArray: true,
				formatAsRGBA: false,
				tolerantDecoding: false,
				maxResolutionInMP: 4,
				maxMemoryUsageInMB: 96,
			});
		else decodePng(bytes, { checkCrc: true });
		// Encode binary directly; TextEncoder would corrupt bytes above 0x7f.
		return { contents: btoa(binary), extension: type };
	} catch {
		throw new AppError(400, "choose a valid JPEG or PNG photo of at most 4 megapixels.");
	}
}
