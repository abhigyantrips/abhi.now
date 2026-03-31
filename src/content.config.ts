import { globWithParser } from "@/lib/parsers";
import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { stat } from "node:fs/promises";

const before = defineCollection({
	loader: globWithParser({
		base: "./src/content/before",
		pattern: "**/*.md",
		parser: async (entry) => {
			const { id, data }: { id: string; data: { title?: string; date?: string } } = entry;

			// Use the filename (id) as the epoch timestamp
			data.title = `life snapshot #${id}`;
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
	loader: glob({
		base: "./src/content/blog",
		pattern: "**/*.md",
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		published: z.boolean().default(true),
		tags: z.array(reference("tags")).optional(),
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
	}),
});

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
		pattern: "**/*.md",
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
	}),
});

export const collections = { before, blog, opinions, snippets, tags, weeknotes };
