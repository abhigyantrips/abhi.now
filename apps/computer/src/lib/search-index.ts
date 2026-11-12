import { getCollection } from "astro:content";
import type { SearchEntry } from "./search";

export async function getSearchIndex(): Promise<SearchEntry[]> {
	const [things, links, blog, weeknotes, snippets, folders] = await Promise.all([
		getCollection("things", ({ data }) => data.published),
		getCollection("links"),
		getCollection("blog", ({ data }) => data.published),
		getCollection("weeknotes"),
		getCollection("snippets"),
		getCollection("snippetCollections"),
	]);
	const names = new Map(folders.map((folder) => [folder.id, folder.data.name]));
	return [
		...things.map(({ id, data }) => ({
			app: "journal" as const,
			title: data.title,
			url: `/things/${id}/`,
			date: data.date.toISOString(),
			text: "",
		})),
		...links.map(({ id, data }) => ({
			app: "journal" as const,
			title: data.link.title,
			url: `/links/${id}/`,
			date: data.date.toISOString(),
			text: "",
		})),
		...blog.map(({ id, data }) => ({
			app: "blog" as const,
			title: data.title,
			url: `https://abhi.now/blog/${id}/`,
			date: data.date.toISOString(),
			text: "",
		})),
		...weeknotes.map(({ id, data }) => ({
			app: "weeknotes" as const,
			title: data.title,
			url: `https://abhi.now/weeknotes/${id}/`,
			date: (data.publishedDate ?? data.toDate).toISOString(),
			text: "",
		})),
		...snippets.map(({ id, data }) => ({
			app: "snippets" as const,
			title: `${names.get(data.collection.id)} · #${id}`,
			url: `https://abhi.now/snippets#${id}`,
			date: data.date.toISOString(),
			text: "",
		})),
	];
}
