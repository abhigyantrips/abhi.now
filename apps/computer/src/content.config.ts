import { glob } from "astro/loaders";

import { z } from "astro/zod";

import { globWithParser } from "@content/loaders";
import { defineCollection, reference } from "astro:content";

const things = defineCollection({
	loader: glob({
		base: "../../content/computer/things",
		pattern: "**/*.mdx",
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		published: z.boolean().default(true),
		tech: z.array(reference("tech")).optional(),
		fields: z.array(reference("fields")).optional(),
	}),
});

const links = defineCollection({
	loader: globWithParser({
		base: "../../content/computer/links",
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
		link: z.object({
			url: z.url(),
			title: z.string(),
		}),
		date: z.coerce.date(),
		tech: z.array(reference("tech")).optional(),
		fields: z.array(reference("fields")).optional(),
	}),
});

const tech = defineCollection({
	loader: glob({
		base: "../../content/computer/tech",
		pattern: "**/[^_]*.json",
	}),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		link: z.url().optional(),
		color: z.string(),
		confidence: z.number().min(1).max(5),
	}),
});

const fields = defineCollection({
	loader: glob({
		base: "../../content/computer/fields",
		pattern: "**/[^_]*.json",
	}),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		color: z.string(),
	}),
});

// Underscore-prefixed JSON files are templates, not calendar entries.
const events = defineCollection({
	loader: glob({
		base: "../../content/computer/events",
		pattern: "**/[^_]*.json",
	}),
	schema: z
		.object({
			name: z.string().trim().min(1),
			fromDate: z.coerce.date(),
			toDate: z.coerce.date(),
			link: z.url().refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS link"),
		})
		.refine((event) => event.toDate >= event.fromDate, {
			message: "toDate must be on or after fromDate",
			path: ["toDate"],
		}),
});

import { collections as shared } from "../../../content/collections";
export const collections = { ...shared, things, links, tech, fields, events };
