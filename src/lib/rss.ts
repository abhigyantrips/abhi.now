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
	const notice =
		(entry.collection === "blog" || entry.collection === "weeknotes") &&
		entry.filePath?.endsWith(".mdx")
			? "<blockquote><p>This post may contain custom HTML and scripts, which could be blocked when reading on an RSS reader. For the best experience, it is recommended to read on the website directly. Thanks!</p></blockquote>\n"
			: "";

	return notice + absolutize(html, site);
}
