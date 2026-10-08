import { parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["childNode"];
type Element = DefaultTreeAdapterMap["element"];

// A quote or list counts as one block, preserving its nested text and order.
const blocks = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "ul", "ol", "pre"]);
const inline = new Set(["a", "em", "strong", "code", "br", "del", "s", "sup", "sub", "abbr"]);
const excluded = new Set([
	"img",
	"picture",
	"figure",
	"figcaption",
	"svg",
	"video",
	"audio",
	"iframe",
	"script",
	"style",
	"template",
	"button",
	"input",
	"form",
	"nav",
	"aside",
	"footer",
	"table",
	"hr",
]);

function isElement(node: Node): node is Element {
	return "tagName" in node;
}

function textContent(node: Node): string {
	if (node.nodeName === "#text") return (node as DefaultTreeAdapterMap["textNode"]).value;
	return isElement(node) ? node.childNodes.map(textContent).join("") : "";
}

function clean(node: Node): Node[] {
	if (!isElement(node)) return node.nodeName === "#text" ? [node] : [];

	const attrs = new Map(node.attrs.map(({ name, value }) => [name, value]));
	const classes = (attrs.get("class") ?? "").split(/\s+/);
	if (
		excluded.has(node.tagName) ||
		attrs.has("hidden") ||
		attrs.get("aria-hidden") === "true" ||
		classes.some((name) => ["autolink-paragraph", "footnotes", "hidden"].includes(name)) ||
		attrs.get("aria-label") === "Link to this paragraph" ||
		attrs.has("data-footnote-ref") ||
		attrs.has("data-footnote-backref") ||
		["doc-noteref", "doc-endnotes", "doc-backlink"].includes(attrs.get("role") ?? "")
	)
		return [];

	node.childNodes = node.childNodes.flatMap(clean);
	// Containers and unsupported inline markup contribute only their content.
	if (!blocks.has(node.tagName) && !inline.has(node.tagName) && node.tagName !== "li") {
		return node.childNodes;
	}

	// Keep only content attributes; page classes, styles, IDs and controls do not
	// belong in the card. Retain ordinary relative/absolute Markdown links.
	node.attrs = node.attrs.filter(
		({ name, value }) =>
			(node.tagName === "a" &&
				name === "href" &&
				!/^\s*(?:javascript|data|vbscript):/i.test(value)) ||
			(node.tagName === "ol" && name === "start") ||
			(node.tagName === "li" && name === "value")
	);
	if (node.tagName !== "br" && !textContent(node).trim()) return [];
	return [node];
}

/** Extract the first three nonempty text blocks from rendered Markdown HTML. */
export function extractOpeningHtml(html: string): string {
	const fragment = parseFragment(html);
	fragment.childNodes = fragment.childNodes.flatMap(clean);
	const opening: Node[] = [];
	for (const node of fragment.childNodes) {
		if (isElement(node) && blocks.has(node.tagName) && textContent(node).trim()) {
			opening.push(node);
			if (opening.length === 3) break;
		}
	}
	fragment.childNodes = opening;
	return serialize(fragment);
}
