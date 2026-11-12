import rss from "@astrojs/rss";
import { SITE } from "@now/consts";
import { renderEntryContent } from "@now/lib/rss";
import { getSnippetFeed } from "@now/lib/snippets";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const snippets = await getSnippetFeed();
	const site = context.site || SITE.URL;

	return rss({
		title: "abhigyan trips's sticky notes.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site,
		trailingSlash: false,
		items: await Promise.all(
			snippets.map(async ({ post, collection }) => ({
				title: `${collection.data.name} · #${post.id}`,
				pubDate: post.data.date,
				link: `/snippets#${post.id}`,
				content: await renderEntryContent(post, new URL(site)),
			}))
		),
	});
}
