import { SITE } from "@/consts";
import { renderEntryContent } from "@/lib/rss";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
	const weeknotes = await getCollection("weeknotes");
	const site = context.site || SITE.URL;

	return rss({
		title: "abhigyan trips's weeknotes.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site,
		items: await Promise.all(
			weeknotes.map(async (note) => ({
				title: note.data.title,
				description: note.data.description,
				pubDate: note.data.publishedDate ?? note.data.toDate,
				categories: ["weeknotes"],
				link: `/weeknotes/${note.id}/`,
				content: await renderEntryContent(note, new URL(site)),
			}))
		),
	});
}
