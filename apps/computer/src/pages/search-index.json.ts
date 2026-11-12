import type { APIRoute } from "astro";
import { getSearchIndex } from "../lib/search-index";

export const prerender = true;

export const GET: APIRoute = async () => {
	const entries = await getSearchIndex();
	return new Response(JSON.stringify(entries), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};
