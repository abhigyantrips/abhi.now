import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import type { AstroSharedContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: AstroSharedContext) {
	const blog = await getCollection("blog");

	return rss({
		title: "abhigyan trips's blog.",
		description: "stories, ideas and random musings from a kid who likes chai.",
		site: context.site || SITE.URL,
		items: blog.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/blog/${post.id}/`,
		})),
	});
}
