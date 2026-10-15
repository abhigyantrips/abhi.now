import { globWithParser } from "@/lib/parsers";
import { glob, type Loader } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection, reference } from "astro:content";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const before = defineCollection({
	loader: globWithParser({
		base: "./src/content/before",
		pattern: "**/*.md",
		parser: async (entry) => {
			const { id, data }: { id: string; data: { title?: string; date?: string } } = entry;

			// Use the filename (id) as the epoch timestamp
			data.title = `Snapshot #${id}`;
			// If the id is an epoch timestamp, convert it to a Date
			const epochMatch = id.match(/^(\d{10})$/);
			if (epochMatch) {
				const epoch = parseInt(epochMatch[1], 10);
				// Preserve the timestamp independently of the build machine's timezone.
				data.date = new Date(epoch * 1000).toISOString();
			} else {
				// fallback: try ISO date or default
				data.date = id.match(/(\d{4}-\d{2}-\d{2})/)?.[0] ?? new Date().toString();
			}

			return entry;
		},
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string().default(""),
			description: z.string().default("a snapshot in time of what i'm doing."),
			date: z.coerce.date(),
			heroImage: image().optional(),
			tags: z.array(reference("tags")).optional(),
		}),
});

const blog = defineCollection({
	loader: globWithParser({
		base: "./src/content/blog",
		pattern: "**/*.{md,mdx}",
		parser: async (entry) => {
			if (import.meta.env.MODE === "production") {
				const { id, data }: { id: string; data: { published?: boolean } } = entry;

				if (id.startsWith("drafts/") && data.published !== false) {
					throw new Error(
						`All drafts need to be unpublished, dawg.\n\nGo check 'src/content/blog/${id}'`
					);
				}
			}

			return entry;
		},
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		published: z.boolean().default(true),
		tags: z.array(reference("tags")).optional(),
	}),
});

const facets = defineCollection({
	loader: glob({
		base: "./src/content/whoami/facets",
		pattern: "**/*.md",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			heroImage: image().optional(),
			heroAlt: z.string().optional(),
		}),
});

const opinions = defineCollection({
	loader: globWithParser({
		base: "./src/content/opinions",
		pattern: "**/*.md",
		parser: async (entry) => {
			const {
				id,
				data,
				filePath,
			}: { id: string; data: { title?: string; lastUpdated?: string | Date }; filePath?: string } =
				entry;

			// Add 'On' to title
			data.title = `On ${data.title ?? id}`;

			if (filePath) {
				const stats = await stat(filePath);
				data.lastUpdated = stats.mtime;
			} else {
				// If the id is an epoch timestamp, convert it to a Date
				const epochMatch = id.match(/^(\d{10})$/);
				if (epochMatch) {
					const epoch = parseInt(epochMatch[1], 10);
					// Convert to local timezone string
					data.lastUpdated = new Date(epoch * 1000).toLocaleString();
				} else {
					// fallback: try ISO date or default
					data.lastUpdated = id.match(/(\d{4}-\d{2}-\d{2})/)?.[0] ?? new Date().toString();
				}
			}

			return entry;
		},
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().default(""),
		lastUpdated: z.coerce.date(),
		iconUrl: z.string(),
		iconSize: z.number().optional().default(14),
	}),
});

const people = defineCollection({
	loader: glob({
		base: "./src/content/people",
		pattern: "**/[^_]*.json",
	}),
	schema: z.object({
		name: z.string(),
		description: z.string().optional(),
		image: z.string().optional(),
		url: z.string().optional(),
		thing: z.object({
			description: z.string().optional(),
			image: z.string().optional(),
			url: z.string().optional(),
		}),
	}),
});

const projects = defineCollection({
	loader: glob({
		base: "./src/content/projects",
		pattern: "**/*.md",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().default(""),
			startDate: z.coerce.date(),
			endDate: z.coerce.date(),
			iconUrl: z.string(),
			iconSize: z.number().optional().default(10),
			place: z.enum([
				"personal",
				"university",
				"peacefulfoundation.org",
				"anti.consumptive.tech",
				"others",
			]),
			tags: z.array(reference("tags")).optional(),
			links: z
				.array(
					z.object({
						label: z.string(),
						url: z.string(),
						icon: z.string().optional(),
					})
				)
				.optional(),
			collaborators: z
				.array(
					z.object({
						name: z.string(),
						url: z.string().optional(),
					})
				)
				.optional(),
			attachments: z
				.array(
					z.object({
						src: image(),
						alt: z.string().optional(),
					})
				)
				.optional(),
		}),
});

const snippetsBase = "./src/content/snippets";

const snippetCollectionSchema = z.object({
	name: z.string().trim().min(1),
	description: z.string().trim().min(1),
	permalink: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

// Validate the whole tree before glob can overwrite entries with duplicate IDs.
// This also checks relationships independently of collection loading order.
async function validateSnippetTree(directory: string) {
	const files = await readdir(directory, { recursive: true });
	const collections = new Set<string>();
	const permalinks = new Map<string, string>();
	const timestamps = new Map<string, string>();

	for (const file of files.filter((file) => basename(file) === "_collection.json")) {
		const folder = dirname(file);
		if (folder === "." || dirname(folder) !== ".") {
			throw new Error(`Snippet metadata must be in a collection folder: ${file}`);
		}
		const metadata = snippetCollectionSchema.parse(
			JSON.parse(await readFile(join(directory, file), "utf8"))
		);
		const existing = permalinks.get(metadata.permalink);
		if (existing) {
			throw new Error(
				`Duplicate snippet collection permalink "${metadata.permalink}": ${existing} and ${file}`
			);
		}
		permalinks.set(metadata.permalink, file);
		collections.add(folder);
	}

	for (const file of files.filter((file) => file.endsWith(".md"))) {
		const timestamp = basename(file, ".md");
		if (!/^\d{10}$/.test(timestamp)) {
			throw new Error(`Invalid snippet timestamp: ${file}; expected a 10-digit epoch filename`);
		}
		const existing = timestamps.get(timestamp);
		if (existing) {
			throw new Error(`Duplicate snippet timestamp "${timestamp}": ${existing} and ${file}`);
		}
		timestamps.set(timestamp, file);
		if (!collections.has(dirname(file))) {
			throw new Error(`Snippet has no matching _collection.json: ${file}`);
		}
	}
	return timestamps;
}

function snippetCollectionsLoader() {
	const loader = glob({
		base: snippetsBase,
		pattern: "**/_collection.json",
		generateId: ({ entry }) => basename(dirname(entry)),
	});
	const originalLoad = loader.load;
	loader.load = async (context) => {
		// Glob skips unchanged files, even when an older schema stripped fields.
		// Reparse cached metadata that no longer satisfies the current schema.
		for (const entry of context.store.values()) {
			if (!snippetCollectionSchema.safeParse(entry.data).success) {
				context.store.delete(entry.id);
			}
		}
		await originalLoad(context);
	};
	return loader;
}

function snippetsLoader(): Loader {
	const loader = globWithParser({
		base: snippetsBase,
		pattern: "**/*.md",
		generateId: ({ entry }) => basename(entry, ".md"),
		parser: async (entry) => ({
			...entry,
			data: {
				...entry.data,
				collection: basename(dirname(entry.filePath!)),
				date: new Date(Number(entry.id) * 1000).toISOString(),
			},
		}),
	});
	const originalLoad = loader.load;
	loader.load = async (context) => {
		const directory = fileURLToPath(new URL(snippetsBase, context.config.root));
		const files = await validateSnippetTree(directory);
		// A folder move keeps the ID and body digest, but changes the reference
		// and relative image paths. Invalidate that entry before glob's cache check.
		for (const entry of context.store.values()) {
			const file = files.get(entry.id);
			if (
				file &&
				entry.filePath &&
				resolve(fileURLToPath(context.config.root), entry.filePath) !== join(directory, file)
			) {
				context.store.delete(entry.id);
			}
		}
		await originalLoad(context);
	};
	return loader;
}

const snippetCollections = defineCollection({
	loader: snippetCollectionsLoader(),
	schema: snippetCollectionSchema,
});

const snippets = defineCollection({
	loader: snippetsLoader(),
	schema: z.object({
		collection: reference("snippetCollections"),
		date: z.coerce.date(),
	}),
});

const tags = defineCollection({
	loader: glob({
		base: "./src/content/tags",
		pattern: "**/[^_]*.json",
	}),
	schema: z.object({
		name: z.string(),
		description: z.string().optional(),
		color: z.string(),
	}),
});

const weeknotes = defineCollection({
	loader: globWithParser({
		base: "./src/content/weeknotes",
		pattern: "**/*.{md,mdx}",
		parser: async (entry) => {
			const {
				data,
			}: { data: { title?: string; description?: string; fromDate?: string; toDate?: string } } =
				entry;

			const from = new Date(data.fromDate!);
			const to = new Date(data.toDate!);

			const firstDayOfYear = new Date(from.getFullYear(), 0, 1);
			const pastDays = (from.getTime() - firstDayOfYear.getTime()) / 86400000;
			const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

			const formatDate = (d: Date) =>
				d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

			data.title = `(#${from.getFullYear()}-W${week}) ${data.title}`;
			data.description = `This weeknote covers the week of ${formatDate(from)} – ${formatDate(to)}.`;

			return entry;
		},
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().default(""),
		fromDate: z.coerce.date(),
		toDate: z.coerce.date(),
		publishedDate: z.coerce.date().optional(),
	}),
});

export const collections = {
	before,
	blog,
	facets,
	opinions,
	people,
	projects,
	snippetCollections,
	snippets,
	tags,
	weeknotes,
};
