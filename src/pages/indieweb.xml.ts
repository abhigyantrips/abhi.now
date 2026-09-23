import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
	const blog = await getCollection("blog", ({ data }) => data.published);
	const weeknotes = await getCollection("weeknotes");
	const before = await getCollection("before");
	const site = new URL(context.site || SITE.URL);

	const blogItems = await Promise.all(
		blog.map(async (post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/blog/${post.id}/`,
			content: await renderEntryContent(post, site),
		}))
	);

	const weeknoteItems = await Promise.all(
		weeknotes.map(async (note) => ({
			title: note.data.title,
			description: note.data.description,
			pubDate: note.data.publishedDate ?? note.data.toDate,
			categories: ["weeknotes"],
			link: `/weeknotes/${note.id}/`,
			content: await renderEntryContent(note, site),
		}))
	);

	const beforeItems = await Promise.all(
		before.map(async (post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/before/${post.id}/`,
			content: await renderEntryContent(post, site),
		}))
	);

	const items = [...blogItems, ...weeknoteItems, ...beforeItems].sort(
		(a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)
	);

	return rss({
		title: "abhigyan trips's indieweb feed.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site,
		items,
	});
}
