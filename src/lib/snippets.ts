import { getCollection } from "astro:content";

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
