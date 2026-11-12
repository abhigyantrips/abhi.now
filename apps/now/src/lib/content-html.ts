import mdxRenderer from "@astrojs/mdx/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Image } from "astro:assets";
import type { CollectionEntry, CollectionKey } from "astro:content";
import { render } from "astro:content";

let container: Promise<AstroContainer> | undefined;

function getContainer() {
	return (container ??= AstroContainer.create().then((instance) => {
		instance.addServerRenderer({ renderer: mdxRenderer });
		return instance;
	}));
}

/** Render the Content component, including MDX expressions and imported components. */
export async function renderEntryHtml<C extends CollectionKey>(
	entry: CollectionEntry<C>
): Promise<string> {
	const { Content } = await render(entry);
	const renderer = await getContainer();
	const html = await renderer.renderToString(Content);
	if (entry.collection === "snippets") {
		const snippet = entry as CollectionEntry<"snippets">;
		if (snippet.data.type === "photos") {
			const image = await renderer.renderToString(Image, {
				props: {
					src: snippet.data.image,
					alt: snippet.data.imageAlt,
					width: Math.min(960, snippet.data.image.width),
				},
			});
			return image + html;
		}
	}
	return html;
}
