import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import type { AstroSharedContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: AstroSharedContext) {
	const before = await getCollection("before");

	return rss({
		title: "abhigyan trips's before.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site: context.site || SITE.URL,
		items: before.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/before/${post.id}/`,
		})),
	});
}
