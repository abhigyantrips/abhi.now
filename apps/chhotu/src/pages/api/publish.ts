import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { clearSession, requireOrigin, requireSession } from "../../lib/auth";
import { AppError, errorResponse, json } from "../../lib/errors";
import { publishSnippet, validatePublish } from "../../lib/github";
import { MAX_PUBLISH_BYTES } from "../../lib/publish-limits";
export const POST: APIRoute = async (context) => {
	try {
		requireOrigin(context.request, env);
		const { token } = await requireSession(context, env);
		if (!context.request.headers.get("Content-Type")?.startsWith("application/json"))
			throw new AppError(415, "send your snippet as JSON.");
		// Bound reads even for chunked bodies, before parsing or making GitHub requests.
		const reader = context.request.body?.getReader();
		if (!reader) throw new AppError(400, "missing snippet.");
		const chunks: Uint8Array[] = [];
		let size = 0;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			size += value.length;
			if (size > MAX_PUBLISH_BYTES) {
				await reader.cancel();
				throw new AppError(
					413,
					"this upload is too large. use a photo up to 10 MiB and Markdown up to 100 KB."
				);
			}
			chunks.push(value);
		}
		const bytes = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.length;
		}
		let raw: unknown;
		try {
			raw = JSON.parse(new TextDecoder().decode(bytes));
		} catch {
			throw new AppError(400, "invalid snippet.");
		}
		return json(await publishSnippet(token, validatePublish(raw)));
	} catch (error) {
		if (error instanceof AppError && error.status === 401) clearSession(context);
		return errorResponse(error);
	}
};
