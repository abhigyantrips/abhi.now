// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

import rehypeFigure from "@microflash/rehype-figure";

import { codeMetaTransformer } from "./src/lib/shiki-transformers.ts";

import mdx from "@astrojs/mdx";

import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import { cp, rm } from "node:fs/promises";
import nowConfig from "../now/astro.config.mjs";

const localProcessor = unified({ rehypePlugins: [rehypeFigure] });
const sharedProcessor = nowConfig.markdown?.processor;
/** @type {import("@astrojs/markdown-remark").MarkdownProcessor} */
const processor = {
	name: "local-and-shared",
	options: {},
	async createRenderer(options) {
		if (!sharedProcessor) throw new Error("Now Markdown processor is required");
		const local = await localProcessor.createRenderer(options);
		const shared = await sharedProcessor.createRenderer(options);
		return {
			render(content, context) {
				return (context?.fileURL?.pathname.includes("/content/computer/") ? local : shared).render(
					content,
					context
				);
			},
		};
	},
	async createMdxRenderer(options, mdx) {
		if (!sharedProcessor?.createMdxRenderer || !localProcessor.createMdxRenderer)
			throw new Error("Both processors must support MDX");
		const local = await localProcessor.createMdxRenderer(options, mdx);
		const shared = await sharedProcessor.createMdxRenderer(options, mdx);
		return {
			process(content, filePath, frontmatter) {
				return (filePath.includes("/content/computer/") ? local : shared).process(
					content,
					filePath,
					frontmatter
				);
			},
		};
	},
};

// https://astro.build/config
export default defineConfig({
	site: "https://abhi.computer",
	output: "static",
	trailingSlash: "always",

	session: {
		driver: {
			entrypoint: "unstorage/drivers/null",
		},
	},

	adapter: cloudflare({
		imageService: "cloudflare",
		// Static content routes use Astro's Node renderer in development and at build time.
		prerenderEnvironment: "node",
	}),

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Sour Gummy",
			cssVariable: "--font-gummy",
			weights: [400, 600],
			styles: ["normal", "italic"],
			formats: ["woff2"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Atkinson Hyperlegible",
			cssVariable: "--font-atkinson",
			weights: [400, 700],
			styles: ["normal", "italic"],
			formats: ["woff2"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Maple Mono",
			cssVariable: "--font-mono",
		},
	],

	markdown: {
		processor,
		shikiConfig: {
			themes: {
				light: "vitesse-light",
				dark: "vitesse-dark",
			},
			transformers: [codeMetaTransformer],
		},
	},

	integrations: [
		mdx(),
		sitemap(),
		{
			name: "local-now-assets",
			hooks: {
				"astro:config:setup": async () => {
					const assets = new URL("./public/now-assets/", import.meta.url);
					await rm(assets, { recursive: true, force: true });
					await cp(new URL("../now/public/", import.meta.url), assets, { recursive: true });
				},
			},
		},
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
