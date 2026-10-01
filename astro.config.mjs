// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import { satteri } from "@astrojs/markdown-satteri";

import satteriAutolinkParagraphs from "satteri-autolink-paragraphs";
import satteriFigure from "satteri-figure";

import mdx from "@astrojs/mdx";

// Sätteri's Smartypants handles my en dashes correctly, but they look
// the same as normal dashes on Sour Gummy. So this thing handles converting
// them into em dashes.
const enDashConversion = {
	name: "en-dash-conversion",
	text(node, ctx) {
		if (node.value.includes("--")) {
			ctx.setProperty(node, "value", node.value.replaceAll("--", "—"));
		}
	},
};

// https://astro.build/config
export default defineConfig({
	site: import.meta.env.DEV ? "http://localhost:4321" : "https://abhi.now",
	output: "static",

	session: {
		driver: {
			entrypoint: "unstorage/drivers/null",
		},
	},

	adapter: cloudflare({
		imageService: "cloudflare",
	}),

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Sour Gummy",
			cssVariable: "--font-gummy",
		},
	],

	integrations: [sitemap(), mdx()],

	markdown: {
		processor: satteri({
			features: {
				smartPunctuation: { dashes: false },
			},
			mdastPlugins: [enDashConversion],
			hastPlugins: [
				satteriFigure,
				satteriAutolinkParagraphs({
					paragraphProperties: {
						className: ["group"],
					},
					properties: {
						className: [
							"hidden md:block invisible group-hover:visible no-underline text-(--color-text)/50",
						],
					},
				}),
			],
		}),
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
