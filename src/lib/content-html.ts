import mdxRenderer from "@astrojs/mdx/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
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
	return (await getContainer()).renderToString(Content);
}
