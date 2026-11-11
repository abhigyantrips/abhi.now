import { getCollection } from "astro:content";
import middlewareSource from "../middleware.ts?raw";
import htmlSource from "./embed-html.ts?raw";
import policySource from "./embed-policy.ts?raw";
import { getEmbedRoutes } from "./embed-routes";

interface EntryDigest {
	id: string;
	digest?: unknown;
}
const digests = (entries: readonly EntryDigest[]) =>
	entries
		.map((entry) => [entry.id, entry.digest])
		.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

/** Data dependencies not captured by the route's own template dependency hash. */
export async function getEmbedBuildContext() {
	const routes = await getEmbedRoutes();
	const tags = await getCollection("tags");
	const inputs = JSON.stringify([
		new Date().getFullYear(), // The shared footer prints the build year.
		routes.map((page) => [page.canonical, page.path, page.scope]).sort(),
		digests(tags),
		middlewareSource,
		htmlSource,
		policySource,
	]);
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(inputs));
	const sharedKey = Array.from(new Uint8Array(digest), (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");
	return {
		page(canonical: string) {
			const page = routes.find((page) => page.canonical === canonical);
			if (!page) throw new Error(`No embed route for ${canonical}`);
			return page;
		},
		// Content changes invalidate the entry/folder, while route publication or
		// transform changes invalidate all affected navigation. Imported layouts,
		// scripts, styles, and rendered MDX dependencies are also tracked by Astro.
		cacheKey(entries: readonly EntryDigest[]) {
			return JSON.stringify([sharedKey, digests(entries)]);
		},
	};
}
