import { getCollection } from "astro:content";

export function formatSnippetDate(date: Date) {
	return {
		publishedDate: date.toLocaleDateString("en-GB", {
			timeZone: "Asia/Kolkata",
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
		publishedTime: date.toLocaleTimeString("en-GB", {
			timeZone: "Asia/Kolkata",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}),
	};
}

export async function getSnippetFeed(collectionId?: string) {
	const [snippets, collections] = await Promise.all([
		getCollection("snippets", (post) => !collectionId || post.data.collection.id === collectionId),
		getCollection("snippetCollections"),
	]);
	const byId = new Map(collections.map((collection) => [collection.id, collection]));

	return snippets
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
		.map((post) => {
			const collection = byId.get(post.data.collection.id);
			if (!collection) {
				throw new Error(
					`Snippet ${post.id} references missing collection ${post.data.collection.id}`
				);
			}
			return { post, collection };
		});
}
