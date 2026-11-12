import assert from "node:assert/strict";
import test from "node:test";
import { parseFeed, plainText } from "../src/lib/rss-search.ts";
import { searchEntries } from "../src/lib/search.ts";

const entry = (title, text, date = "2026-01-01", app = "journal") => ({
	title,
	text,
	date,
	app,
	url: "/things/example",
});

test("search only matches titles, across applications, requiring every term", () => {
	const entries = ["journal", "blog", "weeknotes", "snippets", "projects"].map((app) =>
		entry("Cloudflare cache", "unsearchable description", undefined, app)
	);
	entries.push(entry("Other", "Cloudflare cache"));
	assert.equal(searchEntries(entries, "CLOUDFLARE cache").length, 5);
	assert.equal(searchEntries(entries, "unsearchable").length, 0);
	assert.equal(searchEntries(entries, "Cloudflare unknown").length, 0);
	assert.equal(searchEntries(entries, " ").length, 0);
});

test("exact titles rank first, then title matches by recency", () => {
	const entries = [
		entry("Astro notes", "", "2026-11-01"),
		entry("Astro", "", "2026-01-01"),
		entry("Astro notes", "", "2026-10-01"),
		entry("Other", "Astro", "2026-12-01"),
	];
	assert.deepEqual(
		searchEntries(entries, "astro").map((item) => item.date),
		["2026-01-01", "2026-11-01", "2026-10-01"]
	);
	assert.equal(searchEntries([entry("Café", "")], "cafe").length, 1);
});

const item = (url = "https://abhi.now/blog/example/") =>
	`<item><title>A &amp; B</title><link>${url}</link><pubDate>Fri, 18 Sep 2026 00:00:00 GMT</pubDate><description>A description.</description><content:encoded><![CDATA[<p>Body-only &amp; café text.</p><script>ignore-me</script>]]></content:encoded></item>`;
const rss = (items) =>
	`<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${items}</channel></rss>`;

test("RSS extracts titles and dates without indexing descriptions or bodies", () => {
	const [result] = parseFeed(rss(item()), "blog");
	assert.equal(result.title, "A & B");
	assert.equal(result.text, "");
	assert.equal(result.date, "2026-09-18T00:00:00.000Z");
	assert.equal(result.app, "blog");
	assert.equal(parseFeed(rss(item() + item()), "blog").length, 2);
	assert.equal(
		parseFeed(rss(item("https://abhi.now/weeknotes/2026/10/")), "weeknotes")[0].app,
		"weeknotes"
	);
	assert.equal(searchEntries([result], "body-only").length, 0);
});

test("RSS rejects malformed feeds and destinations outside the owning app", () => {
	assert.throws(() => parseFeed("<rss>", "blog"));
	assert.throws(() => parseFeed("<html></html>", "blog"));
	assert.throws(() => parseFeed(rss(item("https://example.com/blog/example/")), "blog"));
	assert.throws(() => parseFeed(rss(item("https://abhi.now/weeknotes/2026/10/")), "blog"));
	assert.deepEqual(parseFeed(rss(""), "blog"), []);
});

test("local Markdown retains searchable code and link labels", () => {
	assert.equal(
		plainText(
			'import X from "x";\n# Cache\nUse `stale-while-revalidate` and [Astro](https://astro.build).'
		),
		"Cache Use stale-while-revalidate and Astro."
	);
});

test("snippets supports feed links with fragment permalinks", () => {
	const [snippet] = parseFeed(rss(item("https://abhi.now/snippets#1794066120")), "snippets");
	assert.equal(snippet.app, "snippets");
	assert.equal(new URL(snippet.url).hash, "#1794066120");
	assert.throws(() => parseFeed(rss(item("https://abhi.now/snippets-unrelated")), "snippets"));
});
