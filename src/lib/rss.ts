import mdxRenderer from "@astrojs/mdx/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { CollectionEntry, CollectionKey } from "astro:content";
import { render } from "astro:content";

let container: AstroContainer | undefined;

async function getContainer() {
	if (!container) {
		container = await AstroContainer.create();
		container.addServerRenderer({ renderer: mdxRenderer });
	}
	return container;
}

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
	const { Content } = await render(entry);
	const html = await (await getContainer()).renderToString(Content);

	return absolutize(html, site);
}
