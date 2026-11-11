import type { AstroIntegration } from "astro";
import { copyFile, glob, mkdir, readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const COLLECTOR = "__ABHI_ASTRO_CARDS_COLLECTOR__";

/** Compatibility workaround for astro-cards 1.0.1 + Astro incremental builds. */
export default function stableCardCache(): AstroIntegration {
	let collector: string | undefined;
	let cacheDir: URL;
	let assets: string;
	return {
		name: "abhi:stable-card-cache",
		hooks: {
			"astro:config:setup"({ command, updateConfig }) {
				if (command !== "build") return;
				updateConfig({
					vite: {
						plugins: [
							{
								name: "abhi:stable-card-collector",
								enforce: "post",
								apply: "build",
								applyToEnvironment: (environment) => environment.name === "prerender",
								transform(code, id) {
									if (id !== "\0virtual:astro-cards") return;
									const match = code.match(/"collector":("[^"\n]*")/);
									if (!match)
										throw new Error(
											"astro-cards collector format changed; review stable-card-cache.ts"
										);
									collector = JSON.parse(match[1]);
									const url = new URL(collector!);
									if (
										url.protocol !== "http:" ||
										url.hostname !== "127.0.0.1" ||
										!url.port ||
										url.pathname !== "/"
									)
										throw new Error("Unexpected astro-cards collector URL");
									// Astro hashes transformed module source. Keep this value stable there,
									// then substitute the real address only in the executable output chunk.
									return { code: code.replace(match[1], JSON.stringify(COLLECTOR)), map: null };
								},
								renderChunk(code) {
									if (!code.includes(COLLECTOR)) return;
									if (!collector) throw new Error("Missing astro-cards build collector");
									return { code: code.replaceAll(COLLECTOR, collector), map: null };
								},
							},
						],
					},
				});
			},
			"astro:config:done"({ config }) {
				cacheDir = new URL("astro-cards/", config.cacheDir);
				assets = config.build.assets;
			},
			async "astro:build:done"({ dir, logger }) {
				// A reused page never calls renderCard(), so astro-cards will not emit its
				// image this build. Restore only images referenced by the final HTML. This
				// hook runs AFTER astro-cards' own build:done hook in astro.config.mjs.
				const root = fileURLToPath(dir);
				const required = new Set<string>();
				for await (const file of glob("**/*.html", { cwd: root })) {
					const html = parse(await readFile(join(root, file), "utf8"));
					const visit = (node: typeof html | (typeof html.childNodes)[number]): void => {
						if ("tagName" in node && node.tagName === "meta") {
							const property = node.attrs.find((attr) => attr.name === "property")?.value;
							const content = node.attrs.find((attr) => attr.name === "content")?.value;
							if (content && (property === "og:image" || property === "twitter:image")) {
								const path = new URL(content, "https://abhi.now").pathname;
								if (path.startsWith(`/${assets}/`) && /\.[a-f0-9]{20}\.(jpg|png|webp)$/.test(path))
									required.add(basename(path));
							}
						}
						if ("childNodes" in node) for (const child of node.childNodes) visit(child);
					};
					visit(html);
				}
				let restored = 0;
				for (const file of required) {
					const output = new URL(`${assets}/${file}`, dir);
					if (
						await stat(output).then(
							() => true,
							() => false
						)
					)
						continue;
					await mkdir(new URL(`${assets}/`, dir), { recursive: true });
					try {
						await copyFile(new URL(file, cacheDir), output);
					} catch (cause) {
						throw new Error(
							`Missing cached card ${file}; run pnpm astro build --force to regenerate it.`,
							{ cause }
						);
					}
					restored++;
				}
				if (restored) logger.info(`Restored ${restored} card images referenced by reused HTML`);
			},
		},
	};
}
