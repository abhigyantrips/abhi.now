import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { SearchEntry } from "./search";

const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false, htmlEntities: true });

export function plainText(value: string) {
	const text = value
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/^import\s.+$/gm, " ")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[`#*_~]+/g, " ");
	// Decode entities left in rendered HTML after the RSS/XML layer is parsed.
	const decoded = parser.parse(`<text>${text}</text>`).text;
	return String(decoded ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

export function parseFeed(xml: string, app: "blog" | "weeknotes" | "snippets"): SearchEntry[] {
	if (XMLValidator.validate(xml) !== true) throw new Error(`Invalid ${app} RSS feed`);
	const channel = parser.parse(xml).rss?.channel;
	if (channel === undefined || channel === null)
		throw new Error(`Missing channel in ${app} RSS feed`);
	const items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];
	return items.map((item: Record<string, string>) => {
		const url = new URL(item.link);
		if (
			url.origin !== "https://abhi.now" ||
			!(url.pathname.startsWith(`/${app}/`) || (app === "snippets" && url.pathname === "/snippets"))
		) {
			throw new Error(`Unexpected destination in ${app} RSS feed`);
		}
		return {
			app,
			title: plainText(item.title ?? ""),
			url: url.href,
			date: new Date(item.pubDate).toISOString(),
			text: "",
		};
	});
}
