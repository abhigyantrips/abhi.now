import type { APIContext } from "astro";
import { encode } from "fast-png";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { setSession, type Secrets } from "../src/lib/auth";
import { MAX_PUBLISH_BYTES } from "../src/lib/publish-limits";

const env: Secrets = {
	APP_ORIGIN: "https://chhotu.abhi.now",
	GITHUB_CLIENT_ID: "test-client",
	GITHUB_CLIENT_SECRET: "test-secret",
	SESSION_SECRET: "publish-test-session-secret-".repeat(2),
};
const hooks = registerHooks({
	resolve(specifier, context, next) {
		if (specifier === "cloudflare:workers")
			return {
				url: `data:text/javascript,${encodeURIComponent(`export const env = ${JSON.stringify(env)};`)}`,
				shortCircuit: true,
			};
		return next(specifier, context);
	},
});
const { POST } = await import("../src/pages/api/publish");
hooks.deregister();

async function context(
	body: BodyInit,
	{ session = true, origin = env.APP_ORIGIN }: { session?: boolean; origin?: string } = {}
) {
	const cookies = new Map<string, { value: string }>();
	const context = {
		url: new URL(`${env.APP_ORIGIN}/api/publish`),
		request: new Request(`${env.APP_ORIGIN}/api/publish`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: origin },
			body,
			duplex: "half",
		} as RequestInit),
		cookies: {
			get: (key: string) => cookies.get(key),
			set: (key: string, value: string) => cookies.set(key, { value }),
			delete: (key: string) => cookies.delete(key),
		},
	} as unknown as APIContext;
	if (session) await setSession(context, env, "test-token");
	return context;
}

test("photo request above the old cap publishes one commit; invalid images and auth failures do not", async () => {
	const pixels = new Uint8Array(512 * 512 * 4);
	for (let i = 0; i < pixels.length; i += 65536)
		crypto.getRandomValues(pixels.subarray(i, i + 65536));
	const png = encode({ width: 512, height: 512, channels: 4, data: pixels });
	const payload = {
		epoch: 1792315800,
		body: "",
		collection: "photos",
		imageAlt: "Trees",
		image: { base64: Buffer.from(png).toString("base64") },
		expectedHead: "a".repeat(40),
		requestId: "0e8cc16b-5e40-4ba8-830d-328198390038",
	};
	const json = JSON.stringify(payload);
	assert.ok(Buffer.byteLength(json) > 650_000);
	const original = globalThis.fetch;
	const commits: any[] = [];
	globalThis.fetch = async (url, init) => {
		const path = String(url);
		if (path.includes("/git/ref/")) return Response.json({ object: { sha: payload.expectedHead } });
		if (path.includes("/git/trees/"))
			return Response.json({
				truncated: false,
				tree: [{ type: "blob", path: "content/snippets/photos/_collection.json", sha: "metadata" }],
			});
		if (path.includes("/git/blobs/"))
			return Response.json({
				encoding: "base64",
				content: Buffer.from(
					JSON.stringify({
						name: "walks",
						description: "outside",
						permalink: "walks",
						type: "photos",
					})
				).toString("base64"),
			});
		if (path.endsWith("/graphql")) {
			commits.push(JSON.parse(String(init?.body)).variables.input);
			return Response.json({
				data: {
					createCommitOnBranch: {
						commit: {
							oid: "b".repeat(40),
							url: "https://github.com/abhigyantrips/abhi.now/commit/b",
							signature: null,
						},
					},
				},
			});
		}
		throw new Error(`unexpected request: ${path}`);
	};
	try {
		const response = await POST(await context(json));
		assert.equal(response.status, 200, await response.text());
		assert.equal(commits.length, 1);
		assert.equal(commits[0].fileChanges.additions.length, 2);
		assert.deepEqual(
			Buffer.from(commits[0].fileChanges.additions[0].contents, "base64"),
			Buffer.from(png)
		);
		assert.equal(
			(await POST(await context(JSON.stringify({ ...payload, image: { base64: "YmFk" } })))).status,
			400
		);
		assert.equal((await POST(await context(json, { session: false }))).status, 401);
		assert.equal(
			(await POST(await context(json, { origin: "https://elsewhere.example" }))).status,
			403
		);
		assert.equal(commits.length, 1);
	} finally {
		globalThis.fetch = original;
	}
});

test("bounded chunked reads cancel requests above the cap before contacting GitHub", async () => {
	let cancelled = false;
	const stream = new ReadableStream<Uint8Array>({
		pull(controller) {
			controller.enqueue(new Uint8Array(1024 * 1024));
		},
		cancel() {
			cancelled = true;
		},
	});
	const original = globalThis.fetch;
	globalThis.fetch = async () => {
		throw new Error("oversized request reached GitHub");
	};
	try {
		const response = await POST(await context(stream));
		assert.equal(response.status, 413);
		assert.equal(cancelled, true);
		assert.ok(MAX_PUBLISH_BYTES > (10 * 1024 * 1024 * 4) / 3);
	} finally {
		globalThis.fetch = original;
	}
});
