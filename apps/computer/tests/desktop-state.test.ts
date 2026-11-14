import assert from "node:assert/strict";
import { test } from "node:test";
import { belongsToApp, createDesktopState } from "../src/scripts/desktop-state.ts";

function storage() {
	let value: string | null = null;
	return {
		getItem: () => value,
		setItem: (_key: string, next: string) => {
			value = next;
		},
	};
}

test("switching and minimizing preserve location, scroll and filters; close resets the session", () => {
	const saved = storage();
	const desktop = createDesktopState(saved);
	desktop.visit("blog", "/blog/an-article/");
	desktop.remember("blog", "/blog/an-article/", 630, []);
	desktop.visit("weeknotes", "/weeknotes/#month=2026-09");
	desktop.remember("weeknotes", "/weeknotes/#month=2026-09", 120, [true, false]);
	desktop.minimize("weeknotes");
	assert.equal(desktop.state.activeApp, null);
	assert.equal(desktop.state.sessions.weeknotes?.status, "minimized");
	const restored = createDesktopState(saved);
	assert.equal(restored.state.sessions.blog?.href, "/blog/an-article/");
	assert.equal(restored.state.sessions.blog?.scrollByHref["/blog/an-article/"], 630);
	assert.deepEqual(restored.state.sessions.weeknotes?.checksByHref["/weeknotes/#month=2026-09"], [
		true,
		false,
	]);
	restored.visit("weeknotes", restored.state.sessions.weeknotes!.href);
	assert.equal(restored.state.sessions.weeknotes?.status, "open");
	restored.close("weeknotes");
	assert.equal(createDesktopState(saved).state.sessions.weeknotes, undefined);
});

test("unavailable storage and corrupt data do not prevent opening apps", () => {
	const blocked = createDesktopState({
		getItem() {
			throw Error();
		},
		setItem() {
			throw Error();
		},
	});
	blocked.visit("journal", "/journal/");
	assert.equal(blocked.state.activeApp, "journal");
	assert.deepEqual(createDesktopState({ getItem: () => "{", setItem() {} }).state.sessions, {});
});

test("stored locations cannot redirect outside an app, and invalid offsets are discarded", () => {
	for (const href of [
		"https://evil.test/blog/",
		"//evil.test/blog/",
		"/blog/../../settings/",
		"/blog/../settings/",
		"/weeknotes/",
		"/blog\\..\\settings/",
	])
		assert.equal(belongsToApp(href, "blog"), false, href);
	const desktop = createDesktopState({
		getItem: () =>
			JSON.stringify({
				blog: {
					href: "/blog/",
					scrollByHref: { "/blog/": -4, "/blog/a/": "bad", "/settings/": 100 },
				},
			}),
		setItem() {},
	});
	assert.deepEqual(desktop.state.sessions.blog?.scrollByHref, { "/blog/": 0 });
});

test("journal sessions include its article and taxonomy routes", () => {
	for (const href of ["/things/a-post/", "/links/", "/tech/astro/", "/fields/web/"]) {
		assert.equal(belongsToApp(href, "journal"), true);
	}
	const desktop = createDesktopState();
	desktop.visit("journal", "/things/a-post/");
	assert.equal(desktop.state.sessions.journal?.href, "/things/a-post/");
});
