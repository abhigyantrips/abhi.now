import { indexedDB } from "fake-indexeddb";
import {
	Window,
	type HTMLButtonElement,
	type HTMLElement,
	type HTMLImageElement,
	type HTMLInputElement,
	type HTMLSelectElement,
	type HTMLTextAreaElement,
} from "happy-dom";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { readDraft, storeDraft } from "../src/lib/draft-store";

test("photo draft survives a failed publish and reload, reuses its request ID, and clears after confirmation", async () => {
	Object.defineProperty(globalThis, "indexedDB", { value: indexedDB, configurable: true });
	const markup = (await readFile(new URL("../src/pages/snippets.astro", import.meta.url), "utf8"))
		.replace(/^---[\s\S]*?---/, "")
		.replace(/<script[\s\S]*?<\/script>/g, "");
	const originalFetch = globalThis.fetch;
	const globals = ["window", "document", "navigator", "localStorage", "Option"] as const;
	const originals = globals.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
	let fail = true;
	const payloads: Record<string, any>[] = [];
	const windows: Window[] = [];
	globalThis.fetch = async (url, init) => {
		switch (String(url)) {
			case "/api/session":
				return Response.json({ authenticated: true });
			case "/api/collections":
				return Response.json({
					head: "a".repeat(40),
					collections: [
						{
							folder: "on-disk",
							permalink: "outside",
							name: "walks",
							description: "outdoors",
							type: "photos",
						},
					],
				});
			case "/api/publish":
				payloads.push(JSON.parse(String(init?.body)));
				if (fail) return Response.json({ error: "try again" }, { status: 502 });
				return Response.json({
					recovered: true,
					commit: {
						url: "https://github.com/abhigyantrips/abhi.now/commit/b",
						signature: { isValid: true },
					},
				});
			default:
				throw new Error(`unexpected API ${url}`);
		}
	};
	async function boot(version: number, offline = false, legacy?: Record<string, unknown>) {
		const win = new Window({ url: "https://chhotu.abhi.now/snippets" });
		windows.push(win);
		win.document.write(markup);
		if (offline)
			Object.defineProperty(win.navigator, "onLine", { value: false, configurable: true });
		if (legacy) win.localStorage.setItem("chhotu:snippet-draft:v1", JSON.stringify(legacy));
		for (const key of globals)
			Object.defineProperty(globalThis, key, {
				value:
					key === "Option"
						? function (text: string, value: string) {
								const option = win.document.createElement("option");
								option.textContent = text;
								option.value = value;
								return option;
							}
						: key === "window"
							? win
							: win[key],
				configurable: true,
			});
		// tsx preserves import query parameters, so each boot runs the editor again.
		await import(`../src/scripts/editor.ts?draft-test=${version}`);
		await until(() => !win.document.querySelector<HTMLElement>("#snippet-form")!.inert);
		if (!offline)
			await until(() => !win.document.querySelector<HTMLButtonElement>("#publish")!.disabled);
		return win;
	}
	try {
		const first = await boot(1);
		const select = first.document.querySelector<HTMLSelectElement>("#collection")!;
		select.value = "on-disk";
		select.dispatchEvent(new first.Event("change", { bubbles: true }));
		const image = new File([new Uint8Array([0, 128, 255, 42])], "portrait.png", {
			type: "image/png",
		});
		const picker = first.document.querySelector<HTMLInputElement>("#photo")!;
		Object.defineProperty(picker, "files", { value: [image], configurable: true });
		picker.dispatchEvent(new first.Event("change", { bubbles: true }));
		const alt = first.document.querySelector<HTMLTextAreaElement>("#image-alt")!;
		alt.value = "Sun on trees";
		alt.dispatchEvent(new first.Event("input", { bubbles: true }));
		first.document.querySelector("#preview-tab")!.dispatchEvent(new first.Event("click"));
		assert.equal(first.document.querySelector("#preview .photo-name")!.textContent, "@walks");
		assert.ok(first.document.querySelector("#preview .photo-image"));
		assert.equal(first.document.querySelector("#preview .photo-caption"), null);
		assert.equal(first.document.querySelector<HTMLTextAreaElement>("#body")!.required, false);
		first.document
			.querySelector("#snippet-form")!
			.dispatchEvent(new first.Event("submit", { cancelable: true }));
		await until(() => first.document.querySelector("#publish-error")!.textContent === "try again");
		assert.equal(payloads.length, 1);
		const failed = await readDraft<any>();
		assert.ok(failed.image instanceof Blob);
		assert.equal(failed.body, "");
		assert.equal(failed.imageAlt, "Sun on trees");
		assert.deepEqual(
			new Uint8Array(await failed.image.arrayBuffer()),
			new Uint8Array([0, 128, 255, 42])
		);
		const second = await boot(2, true);
		assert.equal(second.document.querySelector<HTMLSelectElement>("#collection")!.value, "on-disk");
		assert.equal(
			second.document.querySelector<HTMLTextAreaElement>("#image-alt")!.value,
			"Sun on trees"
		);
		assert.equal(second.document.querySelector<HTMLInputElement>("#photo")!.required, false);
		assert.equal(second.document.querySelector<HTMLImageElement>("#photo-preview")!.hidden, false);
		second.document.querySelector("#preview-tab")!.dispatchEvent(new second.Event("click"));
		assert.equal(second.document.querySelector("#preview .photo-name")!.textContent, "@walks");
		assert.ok(second.document.querySelector("#preview .photo-image"));
		Object.defineProperty(second.navigator, "onLine", { value: true, configurable: true });
		second.dispatchEvent(new second.Event("online"));
		await until(() => !second.document.querySelector<HTMLButtonElement>("#publish")!.disabled);
		fail = false;
		second.document
			.querySelector("#snippet-form")!
			.dispatchEvent(new second.Event("submit", { cancelable: true }));
		await until(() => !second.document.querySelector<HTMLElement>("#success")!.hidden);
		await until(async () => (await readDraft()) === undefined);
		assert.equal(payloads.length, 2);
		assert.deepEqual(payloads[1], payloads[0]);
		assert.equal(payloads[1].collection, "on-disk");
		assert.equal(payloads[1].image.base64, Buffer.from([0, 128, 255, 42]).toString("base64"));
		const third = await boot(3, false, {
			body: "old **text** draft",
			collection: "__new__",
			name: "words",
			description: "old words",
			permalink: "words",
			datetime: "2026-11-05T12:34:56",
			requestId: "0e8cc16b-5e40-4ba8-830d-328198390038",
		});
		assert.equal(
			third.document.querySelector<HTMLTextAreaElement>("#body")!.value,
			"old **text** draft"
		);
		assert.equal(third.document.querySelector<HTMLTextAreaElement>("#body")!.required, true);
		assert.equal(
			third.document.querySelector<HTMLSelectElement>("#collection-type")!.value,
			"text"
		);
		assert.equal(
			third.document.querySelector<HTMLInputElement>("#datetime")!.value,
			"2026-11-05T12:34:56"
		);
	} finally {
		globalThis.fetch = originalFetch;
		for (let i = 0; i < globals.length; i++) {
			if (originals[i]) Object.defineProperty(globalThis, globals[i], originals[i]!);
			else Reflect.deleteProperty(globalThis, globals[i]);
		}
		for (const win of windows) await win.happyDOM.close();
	}
});

test("queued saves cannot resurrect a cleared draft", async () => {
	const image = new Blob([new Uint8Array([128, 255])]);
	const saves = [
		storeDraft({ image, body: "one" }),
		storeDraft({ image, body: "two" }),
		storeDraft(null),
	];
	await Promise.all(saves);
	assert.equal(await readDraft(), undefined);
});

async function until(predicate: () => boolean | Promise<boolean>) {
	for (let i = 0; i < 200; i++) {
		if (await predicate()) return;
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
	throw new Error("editor did not reach expected state");
}
