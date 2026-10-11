import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import { getSnippetFeed } from "@/lib/snippets";
import rss from "@astrojs/rss";
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
