import { getCollection } from "astro:content";

/** Both route generation and navigation use this publication-filtered manifest. */
export async function getNowPages() {
	const [posts, notes, facets, folders, projects] = await Promise.all([
		getCollection("blog", ({ data }) => data.published),
		getCollection("weeknotes"),
		getCollection("facets"),
		getCollection("snippetCollections"),
		getCollection("projects"),
	]);
	return [
		...["blog", "weeknotes", "snippets", "whoami", "projects"].map((id) => ({
			path: `/${id}`,
			app: id,
			entry: null,
		})),
		{ path: "/snippets/folders", app: "snippets", entry: null },
		...posts.map((entry) => ({ path: `/blog/${entry.id}`, app: "blog", entry })),
		...notes.map((entry) => ({ path: `/weeknotes/${entry.id}`, app: "weeknotes", entry })),
		...facets.map((entry) => ({ path: `/whoami/${entry.id}`, app: "whoami", entry })),
		...projects.map((entry) => ({ path: `/projects/${entry.id}`, app: "projects", entry })),
		...folders.map((entry) => ({
			path: `/snippets/${entry.data.permalink}`,
			app: "snippets",
			entry,
		})),
	];
}
