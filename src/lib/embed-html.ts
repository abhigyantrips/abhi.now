import parseSrcset from "parse-srcset";
import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";
import valueParser from "postcss-value-parser";
import { embedLink, type EmbedPage } from "./embed-policy.ts";
type Node = DefaultTreeAdapterMap["node"];

/** Runs over the complete rendered document, including raw HTML and MDX. */
export function transformEmbedHtml(
	html: string,
	page: EmbedPage,
	manifest: readonly EmbedPage[],
	origin: string
) {
	const document = parse(html);
	const resource = (value: string) => {
		if (
			!value ||
			value.startsWith("/") ||
			value.startsWith("#") ||
			/^[a-z][a-z\d+.-]*:/i.test(value)
		)
			return value;
		try {
			const url = new URL(value, new URL(`${page.canonical}/`, origin));
			return `${url.pathname}${url.search}${url.hash}`;
		} catch {
			return value;
		}
	};
	const css = (value: string) => {
		const parsed = valueParser(value);
		parsed.walk((node) => {
			if (node.type === "function" && node.value.toLowerCase() === "url") {
				const child = node.nodes[0];
				if (child && (child.type === "word" || child.type === "string"))
					child.value = resource(child.value);
				return false;
			}
		});
		return parsed.toString();
	};
	function visit(node: Node) {
		if ("tagName" in node) {
			const get = (name: string) => node.attrs.find((attr) => attr.name === name)?.value;
			const set = (name: string, value: string) => {
				const attr = node.attrs.find((attr) => attr.name === name);
				if (attr) attr.value = value;
				else node.attrs.push({ name, value });
			};
			const href = get("href");
			if ((node.tagName === "a" || node.tagName === "area") && href !== undefined) {
				const link = embedLink(href, page, manifest, origin, get("target"));
				set("href", link.href);
				set("target", link.target);
				if (link.separate)
					set(
						"rel",
						[
							...new Set([
								...(get("rel") ?? "").split(/\s+/).filter(Boolean),
								"noopener",
								"noreferrer",
							]),
						].join(" ")
					);
			}
			for (const attr of node.attrs) {
				if (
					["src", "poster", "data", "action", "formaction", "cite", "background"].includes(
						attr.name
					) ||
					(attr.name === "href" && !["a", "area"].includes(node.tagName))
				)
					attr.value = resource(attr.value);
				if (attr.name === "srcset" || attr.name === "imagesrcset")
					attr.value = parseSrcset(attr.value)
						.map(
							(item) =>
								`${resource(item.url)}${item.w ? ` ${item.w}w` : ""}${item.h ? ` ${item.h}h` : ""}${item.d ? ` ${item.d}x` : ""}`
						)
						.join(", ");
				if (attr.name === "style") attr.value = css(attr.value);
			}
			if (node.tagName === "style")
				for (const child of node.childNodes) if ("value" in child) child.value = css(child.value);
		}
		if ("childNodes" in node) for (const child of node.childNodes) visit(child);
		if ("content" in node) visit(node.content);
	}
	visit(document);
	return serialize(document);
}
