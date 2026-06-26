// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import rehypeFigure from "@microflash/rehype-figure";

import mdx from "@astrojs/mdx";

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
		rehypePlugins: [rehypeFigure],
	},

	vite: {
		plugins: [tailwindcss()],
		build: {
			rollupOptions: {
				external: ["node:crypto", "node:fs/promises", "node:path", "node:url"],
			},
		},
	},
});
