import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
	const blog = await getCollection("blog", ({ data }) => data.published);
	const site = context.site || SITE.URL;

	return rss({
		title: "abhigyan trips's blog.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site,
		items: await Promise.all(
			blog.map(async (post) => ({
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.date,
				link: `/blog/${post.id}/`,
				content: await renderEntryContent(post, new URL(site)),
			}))
		),
	});
}
