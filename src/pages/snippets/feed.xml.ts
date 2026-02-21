import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import type { AstroSharedContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: AstroSharedContext) {
	const snippets = await getCollection("snippets");

	return rss({
		title: "abhigyan trips's sticky notes.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site: context.site || SITE.URL,
		items: snippets.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/snippets/#${post.id}/`,
		})),
	});
}
