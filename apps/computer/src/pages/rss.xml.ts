import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET() {
	const links = await getCollection("links");
	const things = await getCollection("things", ({ data }) => data.published);

	return rss({
		title: "abhigyan trips's tech shenanigans",
		description: "my place to post about cool links and tech things.",
		site: "https://abhi.computer/",
		trailingSlash: true,
		items: [
			...links.map((link) => ({
				title: link.data.link.title,
				description: link.body,
				pubDate: link.data.date,
				categories: ["link"],
				link: `/links/${link.id}/`,
			})),
			...things.map((thing) => ({
				title: thing.data.title,
				description: thing.data.description,
				pubDate: thing.data.date,
				categories: ["thing"],
				link: `/things/${thing.id}/`,
			})),
		].sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)),
	});
}
