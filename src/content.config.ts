import { globWithParser } from "@/lib/parsers";
import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const before = defineCollection({
	loader: globWithParser({
		base: "./src/content/before",
		pattern: "**/*.md",
		parser: async (entry) => {
			const { id, data }: { id: string; data: { title?: string; date?: string } } = entry;

			// Use the filename (id) as the epoch timestamp
			data.title = id;
			// If the id is an epoch timestamp, convert it to a Date
			const epochMatch = id.match(/^(\d{10})$/);
			if (epochMatch) {
				const epoch = parseInt(epochMatch[1], 10);
				// Convert to local timezone string
				data.date = new Date(epoch * 1000).toLocaleString();
			} else {
				// fallback: try ISO date or default
				data.date = id.match(/(\d{4}-\d{2}-\d{2})/)?.[0] ?? new Date().toString();
			}

			return entry;
		},
	}),
	schema: z.object({
		title: z.string().default(""),
		description: z.string().default("a snapshot in time of what i'm doing."),
		date: z.coerce.date(),
		tags: z.array(reference("tags")).optional(),
	}),
});

const blog = defineCollection({
	loader: glob({
		base: "./src/content/blog",
		pattern: "**/*.md",
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(reference("tags")).optional(),
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

const projects = defineCollection({});

const snippets = defineCollection({
	loader: globWithParser({
		base: "./src/content/snippets",
		pattern: "**/*.md",
		parser: async (entry) => {
			const { id, data }: { id: string; data: { title?: string; date?: string } } = entry;

			// Use the filename (id) as the epoch timestamp
			data.title = id;
			// If the id is an epoch timestamp, convert it to a Date
			const epochMatch = id.match(/^(\d{10})$/);
			if (epochMatch) {
				const epoch = parseInt(epochMatch[1], 10);
				// Convert to local timezone string
				data.date = new Date(epoch * 1000).toLocaleString();
			} else {
				// fallback: try ISO date or default
				data.date = id.match(/(\d{4}-\d{2}-\d{2})/)?.[0] ?? new Date().toString();
			}

			return entry;
		},
	}),
	schema: z.object({
		title: z.string().default(""),
		description: z.string().default("a sticky note to remember."),
		date: z.coerce.date().optional(),
		tags: z.array(reference("tags")).optional(),
	}),
});

export const collections = { blog, tags, snippets, before };
