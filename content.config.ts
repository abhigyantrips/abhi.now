import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	loader: glob({
		base: 'src/content/blog',
		pattern: '**/*.md',
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
	}),
});

const tags = defineCollection({
	loader: glob({
		base: 'src/content/tags',
		pattern: '**/*.json',
	}),
	schema: z.object({
		name: z.string(),
		color: z.string(),
	}),
});

export const collections = { blog, tags };
