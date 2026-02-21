// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: import.meta.env.DEV ? "http://localhost:4321" : "https://abhi.now",
	output: "static",

	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},

		imageService: "cloudflare",
	}),

	integrations: [sitemap()],

	vite: {
		plugins: [tailwindcss()],
		build: {
			rollupOptions: {
				external: ["node:crypto", "node:fs/promises", "node:path", "node:url"],
			},
		},
	},
});
