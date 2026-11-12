import { defineMiddleware } from "astro:middleware";
import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";
import { getNowPages } from "./lib/now-content";

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();
	if (!response.headers.get("content-type")?.includes("text/html")) return response;
	const scope = context.url.pathname.split("/")[1];
	if (!["blog", "weeknotes", "snippets", "whoami", "projects"].includes(scope)) return response;
	const paths = new Set((await getNowPages()).map((page) => page.path));
	const document = parse(await response.text());
	const walk = (node: DefaultTreeAdapterMap["node"], inside = false) => {
		inside ||= "attrs" in node && node.attrs.some((attr) => attr.name === "data-now-content");
		if (inside && "attrs" in node) {
			for (const attr of node.attrs) {
				if (attr.name === "style")
					attr.value = attr.value.replaceAll("url(/icons/", "url(/now-assets/icons/");
				if (
					!["href", "src", "poster"].includes(attr.name) ||
					!attr.value ||
					attr.value.startsWith("#")
				)
					continue;
				let url: URL;
				try {
					url = new URL(attr.value, `https://abhi.now${context.url.pathname}/`);
				} catch {
					continue;
				}
				if (url.origin !== "https://abhi.now") {
					if (node.tagName === "a" && ["http:", "https:"].includes(url.protocol)) {
						set(node, "target", "_blank");
						set(node, "rel", "noopener noreferrer");
					}
					continue;
				}
				const path = url.pathname.replace(/\/$/, "") || "/";
				if (node.tagName === "a" && attr.name === "href") {
					if (paths.has(path) && path.split("/")[1] === scope)
						attr.value = path + url.search + url.hash;
					else {
						attr.value = url.href;
						set(node, "target", "_blank");
						set(node, "rel", "noopener noreferrer");
					}
				} else if (!path.startsWith("/_astro/") && !path.startsWith("/cdn-cgi/"))
					attr.value = `/now-assets${url.pathname}${url.search}${url.hash}`;
			}
		}
		if ("childNodes" in node) for (const child of node.childNodes) walk(child, inside);
	};
	const set = (node: DefaultTreeAdapterMap["element"], name: string, value: string) => {
		const attr = node.attrs.find((a) => a.name === name);
		if (attr) attr.value = value;
		else node.attrs.push({ name, value });
	};
	walk(document);
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(serialize(document), { status: response.status, headers });
});
