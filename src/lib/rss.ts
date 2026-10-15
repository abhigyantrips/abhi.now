import { renderEntryHtml } from "@/lib/content-html";
import type { CollectionEntry, CollectionKey } from "astro:content";

function absolutize(html: string, site: URL): string {
	const resolve = (url: string) => (url.startsWith("/") ? new URL(url, site).href : url);

	return html
		.replace(/(src|href)="([^"]*)"/g, (_, attr: string, url: string) => `${attr}="${resolve(url)}"`)
		.replace(/srcset="([^"]*)"/g, (_, srcset: string) => {
			const resolved = srcset
				.split(",")
				.map((candidate) => {
					const [url, ...descriptor] = candidate.trim().split(/\s+/);
					return [resolve(url), ...descriptor].join(" ");
				})
				.join(", ");
			return `srcset="${resolved}"`;
		});
}

export async function renderEntryContent<C extends CollectionKey>(
	entry: CollectionEntry<C>,
	site: URL
): Promise<string> {
	const html = await renderEntryHtml(entry);

	return absolutize(html, site);
}
