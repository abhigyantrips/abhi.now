import assert from "node:assert/strict";
import { test } from "node:test";
import { cssTimeToMilliseconds } from "../src/scripts/motion.ts";

test("CSS motion durations retain their timing after production minification", () => {
	for (const [css, expected] of [
		["180ms", 180],
		[".18s", 180],
		["0.13s", 130],
		["110ms", 110],
		["1s", 1000],
		["  .18s  ", 180],
		["0s", 0],
		["0ms", 0],
	] as const) {
		assert.equal(cssTimeToMilliseconds(css, 999), expected, css);
	}
});

test("missing or invalid CSS motion durations use the fallback", () => {
	for (const css of ["", "180", "nope", "NaNs", "Infinityms", "-1s"])
		assert.equal(cssTimeToMilliseconds(css, 180), 180, css);
});
