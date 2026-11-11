import { transformEmbedHtml } from "@/lib/embed-html";
import { normalizePath } from "@/lib/embed-policy";
import { getEmbedRoutes } from "@/lib/embed-routes";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	if (!normalizePath(context.url.pathname).endsWith("/embed")) return next();
	const manifest = await getEmbedRoutes();
	const page = manifest.find((item) => item.path === normalizePath(context.url.pathname));
	if (!page) return next();
	const response = await next();
	if (!response.headers.get("content-type")?.includes("text/html")) return response;
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(
		transformEmbedHtml(await response.text(), page, manifest, context.url.origin),
		{ status: response.status, headers }
	);
});
