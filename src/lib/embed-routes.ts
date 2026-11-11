import { getCollection } from "astro:content";
import type { EmbedPage, EmbedScope } from "./embed-policy";

/** Single source for generation and navigation. No resources or plaintext routes. */
export async function getEmbedRoutes() {
	const [posts, notes, folders, facets] = await Promise.all([
		getCollection("blog", ({ data }) => import.meta.env.DEV || data.published),
		getCollection("weeknotes"),
		getCollection("snippetCollections"),
		getCollection("facets"),
	]);
	const routes: EmbedPage[] = [];
	const add = (canonical: string, scope: EmbedScope) =>
		routes.push({ canonical, scope, path: `${canonical}/embed` });
	add("/blog", "/blog");
	for (const post of posts) add(`/blog/${post.id}`, "/blog");
	add("/weeknotes", "/weeknotes");
	for (const note of notes) add(`/weeknotes/${note.id}`, "/weeknotes");
	add("/snippets", "/snippets");
	add("/snippets/folders", "/snippets");
	for (const folder of folders) add(`/snippets/${folder.data.permalink}`, "/snippets");
	add("/whoami", "/whoami");
	for (const facet of facets) add(`/whoami/${facet.id}`, "/whoami");
	if (new Set(routes.map((route) => route.path)).size !== routes.length)
		throw new Error("Duplicate embed route");
	return routes;
}

/** Resolve fixed metadata from the same manifest used by link rewriting. */
export async function getEmbedPage(canonical: string): Promise<EmbedPage> {
	const page = (await getEmbedRoutes()).find((page) => page.canonical === canonical);
	if (!page) throw new Error(`No embed route for ${canonical}`);
	return page;
}
