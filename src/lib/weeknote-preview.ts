import type { ImageMetadata } from "astro";
import { parseFragment, type DefaultTreeAdapterMap } from "parse5";

const images = import.meta.glob<{ default: ImageMetadata }>(
	"/src/**/*.{avif,gif,jpeg,jpg,png,svg,webp}"
);

type Node = DefaultTreeAdapterMap["childNode"];

function firstImage(nodes: Node[]): DefaultTreeAdapterMap["element"] | undefined {
	for (const node of nodes) {
		if (!("tagName" in node)) continue;
		if (node.tagName === "img") return node;
		const image = firstImage(node.childNodes);
		if (image) return image;
	}
}

/** Keep Markdown content order and use original assets, without image-service transforms. */
export async function extractFirstImage(
	html: string,
	filePath?: string
): Promise<string | undefined> {
	const image = firstImage(parseFragment(html).childNodes);
	if (!image) return undefined;

	const attrs = new Map(image.attrs.map(({ name, value }) => [name, value]));
	const placeholder = attrs.get("__astro_image_");
	const src: string | undefined = placeholder ? JSON.parse(placeholder).src : attrs.get("src");
	if (!src) throw new Error("The first Markdown image has no source.");
	if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(src)) return src;
	if (!filePath) throw new Error(`Cannot resolve image "${src}" without a source file path.`);

	const path = decodeURIComponent(new URL(src, new URL(filePath, "file:///")).pathname);
	const load = images[path];
	if (!load) throw new Error(`Cannot import first Markdown image "${src}" from "${filePath}".`);
	return (await load()).default.src;
}

export function formatWeeknoteDateRange(from: Date, to: Date): string {
	const format = (date: Date, year: boolean) =>
		date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			...(year ? ({ year: "numeric" } as const) : {}),
		});
	return `${format(from, from.getFullYear() !== to.getFullYear())} – ${format(to, true)}`;
}
