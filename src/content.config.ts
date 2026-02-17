import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

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

export const collections = { blog, tags };
