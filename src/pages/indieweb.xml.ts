import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import type { AstroSharedContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: AstroSharedContext) {
	const blog = await getCollection("blog");
	const weeknotes = await getCollection("weeknotes");
	const before = await getCollection("before");

	const blogItems = blog.map((post) => ({
		title: post.data.title,
		description: post.data.description,
		pubDate: post.data.date,
		link: `/blog/${post.id}/`,
	}));

	const weeknoteItems = weeknotes.map((note) => ({
		title: note.data.title,
		description: note.data.description,
		pubDate: note.data.fromDate,
		link: `/weeknotes/${note.id}/`,
	}));

	const beforeItems = before.map((post) => ({
		title: post.data.title,
		description: post.data.description,
		pubDate: post.data.date,
		link: `/before/${post.id}/`,
	}));

	const items = [...blogItems, ...weeknoteItems, ...beforeItems].sort(
		(a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)
	);

	return rss({
		title: "abhigyan trips's indieweb feed.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site: context.site || SITE.URL,
		items,
	});
}
