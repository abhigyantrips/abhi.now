import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import type { AstroSharedContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: AstroSharedContext) {
	const weeknotes = await getCollection("weeknotes");

	return rss({
		title: "abhigyan trips's weeknotes.",
		description: "tiny tiny documentation from a kid who likes chai.",
		site: context.site || SITE.URL,
		items: weeknotes.map((note) => ({
			title: note.data.title,
			description: note.data.description,
			pubDate: note.data.fromDate,
			link: `/weeknotes/${note.id}/`,
		})),
	});
}
