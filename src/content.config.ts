import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { globWithParser } from "./lib/parsers";

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

			data.title = id;
			data.date = id.match(/(\d{4}-\d{2}-\d{2})/)?.[0] ?? new Date().toISOString();

			return entry;
		},
	}),
	schema: z.object({
		title: z.string().default(""),
		description: z.string().default("a sticky note by abhigyan trips."),
		date: z.coerce.date().optional(),
		tags: z.array(reference("tags")).optional(),
	}),
});

const befores = defineCollection({
	loader: glob({
		base: "./src/content/befores",
		pattern: "**/*.md",
	}),
	schema: z.object({
		title: z.string().default(Math.floor(new Date().getTime() / 1000).toString()),
		description: z.string(),
		date: z.coerce.date(),
	}),
});

export const collections = { blog, tags };
