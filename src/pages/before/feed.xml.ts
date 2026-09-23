import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
	const before = await getCollection("before");
	const site = context.site || SITE.URL;

	return rss({
		title: "abhigyan trips's 'now' archives'.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site,
		items: await Promise.all(
			before.map(async (post) => ({
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.date,
				link: `/before/${post.id}/`,
				content: await renderEntryContent(post, new URL(site)),
			}))
		),
	});
}
