import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import { getSnippetFeed } from "@/lib/snippets";
import rss from "@astrojs/rss";
import type { APIContext, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

export const getStaticPaths = (async () => {
	const collections = await getCollection("snippetCollections");
	return collections.map((collection) => ({
		params: { slug: collection.data.permalink },
		props: { collection },
	}));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
	const collection: CollectionEntry<"snippetCollections"> = context.props.collection;
	const snippets = await getSnippetFeed(collection.id);
	const site = new URL(context.site || SITE.URL);
	const path = `/snippets/${collection.data.permalink}`;

	return rss({
		title: `abhigyan trips's ${collection.data.name}.`,
		description: collection.data.description,
		site: new URL(path, site),
		trailingSlash: false,
		items: await Promise.all(
			snippets.map(async ({ post }) => ({
				title: `${collection.data.name} · #${post.id}`,
				pubDate: post.data.date,
				link: `${path}#${post.id}`,
				content: await renderEntryContent(post, site),
			}))
		),
	});
}
