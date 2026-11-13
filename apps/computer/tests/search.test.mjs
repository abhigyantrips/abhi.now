import assert from "node:assert/strict";
import test from "node:test";
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
