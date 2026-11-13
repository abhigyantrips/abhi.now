import { encode as encodePng } from "fast-png";
import jpeg from "jpeg-js";
import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../src/lib/errors";
import {
	buildAdditions,
	getSnapshot,
	publishSnippet,
	validatePublish,
	type PublishInput,
	type Snapshot,
} from "../src/lib/github";
import { MAX_IMAGE_BASE64, MAX_IMAGE_BYTES, MAX_PUBLISH_BYTES } from "../src/lib/publish-limits";

const head = "a".repeat(40);
const input: PublishInput = {
	epoch: 1792315800,
	body: "some **words**. नमस्ते 🌱",
	collection: "mine",
	expectedHead: head,
	requestId: "0e8cc16b-5e40-4ba8-830d-328198390038",
};
const collection = {
	type: "text" as const,
	folder: "mine",
	name: "my own words",
	description: "words i said.",
	permalink: "thoughts",
};
const snapshot = (): Snapshot => ({
	head,
	collections: [collection],
	files: new Set(["content/snippets/mine/_collection.json"]),
});
const decode = (value: string) => Buffer.from(value, "base64").toString("utf8");

test("publishes UTF-8 Markdown under the folder, independently of its public permalink", () => {
	const files = buildAdditions(validatePublish(input), snapshot());
	assert.equal(files.length, 1);
	assert.equal(files[0].path, "content/snippets/mine/1792315800.md");
	assert.equal(decode(files[0].contents), input.body + "\n");
});
test("creates collection metadata and first snippet together", () => {
	const newCollection = {
		name: " little things ",
		description: " things i noticed ",
		permalink: "little-things",
	};
	const files = buildAdditions(
		validatePublish({ ...input, collection: "little-things", newCollection }),
		snapshot()
	);
	assert.equal(files.length, 2);
	assert.deepEqual(JSON.parse(decode(files[0].contents)), {
		name: "little things",
		description: "things i noticed",
		permalink: "little-things",
		type: "text",
	});
	assert.equal(files[1].path, "content/snippets/little-things/1792315800.md");
});
test("rejects traversal, malformed dates, metadata, empty bodies, and frontmatter", () => {
	for (const patch of [
		{ collection: "../blog" },
		{ collection: "/mine" },
		{ collection: "MINE" },
		{ epoch: 1792315800000 },
		{ epoch: NaN },
		{ epoch: 1792315800.5 },
		{ body: "---\ndate: 2025\n---\nhi" },
		{ body: "\n---\ncollection: bad\n---\nhi" },
		{ body: "x\0x" },
		{ body: "🌱".repeat(30_000) },
		{ expectedHead: "main" },
		{ requestId: "bad" },
		{ newCollection: { name: "", description: "x", permalink: "mine" } },
		{ newCollection: { name: "ok", description: "ok", permalink: "different" } },
	]) {
		assert.throws(
			() => validatePublish({ ...input, ...patch }),
			AppError,
			JSON.stringify(patch).slice(0, 100)
		);
	}
});
test("rejects duplicate epoch IDs across every collection and duplicate permalinks", () => {
	const state = snapshot();
	state.files.add("content/snippets/quotes/1792315800.md");
	assert.throws(() => buildAdditions(input, state), /already uses/);
	assert.throws(
		() =>
			buildAdditions(
				{
					...input,
					collection: "thoughts",
					newCollection: { name: "hi", description: "hi", permalink: "thoughts" },
				},
				snapshot()
			),
		/already exists/
	);
	assert.throws(
		() => buildAdditions({ ...input, collection: "missing" }, snapshot()),
		/no longer exists/
	);
});

function mockGitHub(
	options: {
		head?: string;
		existing?: boolean;
		recovered?: boolean;
		truncated?: boolean;
		race?: boolean;
		verified?: boolean;
		metadata?: Record<string, unknown>;
	} = {}
) {
	const calls: { url: string; init?: RequestInit }[] = [];
	const original = globalThis.fetch;
	globalThis.fetch = async (url, init) => {
		const path = String(url);
		calls.push({ url: path, init });
		let data: unknown;
		if (path.includes("/git/ref/")) data = { object: { sha: options.head ?? head } };
		else if (path.includes("/git/trees/"))
			data = {
				truncated: options.truncated ?? false,
				tree: [
					{ type: "tree", path: "content/snippets/mine", sha: "folder" },
					{ type: "blob", path: "content/snippets/mine/_collection.json", sha: "metadata" },
					...(options.existing
						? [
								{
									type: "blob",
									path: `content/snippets/mine/${input.epoch}.md`,
									sha: "snippet",
								},
							]
						: []),
				],
			};
		else if (path.includes("/git/blobs/"))
			data = {
				encoding: "base64",
				content: Buffer.from(JSON.stringify(options.metadata ?? collection)).toString("base64"),
			};
		else if (path.includes("/commits?"))
			data = [
				{
					sha: "b".repeat(40),
					html_url: "https://github.com/abhigyantrips/web/commit/b",
					commit: {
						message: `content(snippet): #${input.epoch}\n\nChhotu-Publish-Id: ${options.recovered ? input.requestId : "somebody-else"}`,
						verification: { verified: true, reason: "valid" },
					},
				},
			];
		else if (path.endsWith("/graphql"))
			data = options.race
				? { errors: [{ message: "expected head oid mismatch" }] }
				: {
						data: {
							createCommitOnBranch: {
								commit: {
									oid: "b".repeat(40),
									url: "https://github.com/abhigyantrips/web/commit/b",
									signature: {
										isValid: options.verified ?? true,
										state: "VALID",
										wasSignedByGitHub: true,
									},
								},
							},
						},
					};
		else throw new Error(`unexpected request: ${path}`);
		return Response.json(data);
	};
	return {
		calls,
		restore: () => {
			globalThis.fetch = original;
		},
	};
}
test("uses a single atomic GraphQL commit with the exact headline and expected head", async () => {
	const mock = mockGitHub();
	try {
		const result = await publishSnippet("test-token", input);
		assert.equal(result.commit.signature?.isValid, true);
		const commits = mock.calls.filter((c) => c.url.endsWith("/graphql"));
		assert.equal(commits.length, 1);
		const payload = JSON.parse(String(commits[0].init?.body)).variables.input;
		assert.deepEqual(payload.branch, {
			repositoryNameWithOwner: "abhigyantrips/web",
			branchName: "main",
		});
		assert.equal(payload.message.headline, `content(snippet): #${input.epoch}`);
		assert.equal(payload.expectedHeadOid, head);
		assert.equal(payload.fileChanges.additions.length, 1);
		assert.match(payload.message.body, new RegExp(input.requestId));
	} finally {
		mock.restore();
	}
});
test("refuses stale repository state without sending a commit", async () => {
	const mock = mockGitHub({ head: "c".repeat(40) });
	try {
		await assert.rejects(publishSnippet("test-token", input), /repository changed/);
		assert.equal(
			mock.calls.some((c) => c.url.endsWith("/graphql")),
			false
		);
	} finally {
		mock.restore();
	}
});
test("stops safely if the branch moves during commit creation", async () => {
	const mock = mockGitHub({ race: true });
	try {
		await assert.rejects(publishSnippet("test-token", input), /another commit arrived/);
	} finally {
		mock.restore();
	}
});
test("recovers a successful commit after a lost response, even after the branch moved", async () => {
	const mock = mockGitHub({ existing: true, recovered: true, head: "c".repeat(40) });
	try {
		const result = await publishSnippet("test-token", input);
		assert.equal(result.recovered, true);
		assert.equal(
			mock.calls.some((c) => c.url.endsWith("/graphql")),
			false
		);
	} finally {
		mock.restore();
	}
});
test("does not treat a different request’s snippet as a successful retry", async () => {
	const mock = mockGitHub({ existing: true });
	try {
		await assert.rejects(publishSnippet("test-token", input), /already uses/);
		assert.equal(
			mock.calls.some((c) => c.url.endsWith("/graphql")),
			false
		);
	} finally {
		mock.restore();
	}
});
test("rejects truncated repository trees instead of risking an overwrite", async () => {
	const mock = mockGitHub({ truncated: true });
	try {
		await assert.rejects(getSnapshot("test-token"), /incomplete file list/);
	} finally {
		mock.restore();
	}
});
test("reports the real signature status if GitHub returns an unverified commit", async () => {
	const mock = mockGitHub({ verified: false });
	try {
		const result = await publishSnippet("test-token", input);
		assert.equal(result.commit.signature?.isValid, false);
	} finally {
		mock.restore();
	}
});

const png = encodePng({
	width: 2,
	height: 1,
	channels: 4,
	data: new Uint8Array([0, 128, 255, 255, 255, 0, 128, 255]),
});
const photoInput = {
	...input,
	body: "",
	image: { base64: Buffer.from(png).toString("base64") },
	imageAlt: "Sunlight on trees.",
};
const photoSnapshot = (): Snapshot => ({
	...snapshot(),
	collections: [{ ...collection, type: "photos" }],
});

test("legacy metadata defaults to text; both explicit types work; unsupported types fail", async () => {
	const { type: _, ...legacy } = collection;
	for (const type of [undefined, "text", "photos", "photo", "video", null]) {
		const mock = mockGitHub({ metadata: type === undefined ? legacy : { ...legacy, type } });
		try {
			if (type === undefined || type === "text" || type === "photos") {
				const result = await getSnapshot("token");
				assert.equal(result.collections[0].type, type ?? "text");
				assert.equal(result.collections[0].folder, "mine");
				assert.equal(result.collections[0].permalink, "thoughts");
			} else await assert.rejects(getSnapshot("token"), /invalid metadata/);
		} finally {
			mock.restore();
		}
	}
});
test("text requires a body; a client cannot change an existing collection’s type", async () => {
	assert.throws(() => buildAdditions({ ...input, body: "  " }, snapshot()), /write something/);
	const mock = mockGitHub();
	try {
		await assert.rejects(
			publishSnippet("token", { ...photoInput, type: "photos" } as PublishInput),
			/write something/
		);
		assert.equal(
			mock.calls.some((c) => c.url.endsWith("/graphql")),
			false
		);
	} finally {
		mock.restore();
	}
	assert.throws(
		() => buildAdditions({ ...photoInput, body: "caption" }, snapshot()),
		/photo collection/
	);
});
test("captionless photos and binary bytes round-trip with server-generated paths", () => {
	const files = buildAdditions(
		validatePublish({
			...photoInput,
			image: { ...photoInput.image, path: "../../bad.jpg", name: "bad.gif", type: "text/html" },
		}),
		photoSnapshot()
	);
	assert.equal(files.length, 2);
	assert.equal(files[0].path, `content/snippets/mine/images/${input.epoch}.png`);
	assert.deepEqual(Buffer.from(files[0].contents, "base64"), Buffer.from(png));
	assert.equal(
		decode(files[1].contents),
		`---\nimage: "./images/${input.epoch}.png"\nimageAlt: "Sunlight on trees."\n---\n\n\n`
	);
	assert.doesNotMatch(decode(files[1].contents), /^(type|date|collection):/m);
});
test("JPEG bytes round-trip too, preserving portrait orientation", () => {
	const bytes = jpeg.encode({
		width: 1,
		height: 2,
		data: Buffer.from([0, 128, 255, 255, 255, 0, 128, 255]),
	}).data;
	const files = buildAdditions(
		{ ...photoInput, image: { base64: bytes.toString("base64") } },
		photoSnapshot()
	);
	assert.match(files[0].path, /1792315800.jpg$/);
	assert.deepEqual(Buffer.from(files[0].contents, "base64"), bytes);
});
test("photos require a valid upload and nonblank alt text", () => {
	for (const imageAlt of [undefined, null, "", "  \n\t", "bad\0alt", "a".repeat(4001)])
		assert.throws(
			() => buildAdditions({ ...photoInput, imageAlt } as PublishInput, photoSnapshot()),
			/alt text/
		);
	for (const image of [
		undefined,
		null,
		{},
		{ base64: "bad" },
		{ base64: "<svg>" },
		{ base64: Buffer.from("not an image").toString("base64") },
		{ base64: Buffer.from(png.subarray(0, 25)).toString("base64") },
		{ base64: Buffer.alloc(MAX_IMAGE_BYTES + 1).toString("base64") },
	])
		assert.throws(
			() => buildAdditions({ ...photoInput, image } as PublishInput, photoSnapshot()),
			AppError
		);
	assert.throws(
		() => buildAdditions({ ...photoInput, body: "---\nimage: evil\n---" }, photoSnapshot()),
		/frontmatter/
	);
});
test("alt text cannot escape its quoted YAML scalar", () => {
	const imageAlt =
		'A "tree": \\ shade\n---\ntype: text\nimage: ../../bad\n# 🌱\u0085\u2028\u2029end';
	const files = buildAdditions(
		{ ...photoInput, imageAlt, body: "An optional **caption**." },
		photoSnapshot()
	);
	const md = decode(files[1].contents);
	const lines = md.split("\n");
	assert.equal(JSON.parse(lines[2].slice("imageAlt: ".length)), imageAlt);
	assert.equal(lines[3], "---");
	assert.equal(lines[5], "An optional **caption**.");
	assert.equal(lines.filter((line) => line === "---").length, 2);
});
test("new photo collections add metadata, image and Markdown in one atomic commit", async () => {
	const mock = mockGitHub();
	try {
		await publishSnippet("token", {
			...photoInput,
			collection: "walks",
			newCollection: { name: "walks", description: "outside", permalink: "walks", type: "photos" },
		});
		const commits = mock.calls.filter((c) => c.url.endsWith("/graphql"));
		assert.equal(commits.length, 1);
		const payload = JSON.parse(String(commits[0].init?.body)).variables.input;
		assert.equal(payload.expectedHeadOid, head);
		assert.equal(payload.fileChanges.additions.length, 3);
		assert.equal(JSON.parse(decode(payload.fileChanges.additions[0].contents)).type, "photos");
		assert.deepEqual(
			Buffer.from(payload.fileChanges.additions[1].contents, "base64"),
			Buffer.from(png)
		);
		assert.match(payload.message.body, new RegExp(input.requestId));
	} finally {
		mock.restore();
	}
});
test("photo retries recover across a moved head, while collisions and races still fail", async () => {
	const recovered = mockGitHub({
		existing: true,
		recovered: true,
		head: "c".repeat(40),
		metadata: { ...collection, type: "photos" },
	});
	try {
		assert.equal((await publishSnippet("token", photoInput)).recovered, true);
		assert.equal(
			recovered.calls.some((c) => c.url.endsWith("/graphql")),
			false
		);
	} finally {
		recovered.restore();
	}
	const race = mockGitHub({ race: true, metadata: { ...collection, type: "photos" } });
	try {
		await assert.rejects(publishSnippet("token", photoInput), /another commit/);
	} finally {
		race.restore();
	}
	const state = photoSnapshot();
	state.files.add(`content/snippets/elsewhere/${input.epoch}.md`);
	assert.throws(() => buildAdditions(photoInput, state), /already uses/);
	state.files.delete(`content/snippets/elsewhere/${input.epoch}.md`);
	state.files.add(`content/snippets/mine/images/${input.epoch}.png`);
	assert.throws(() => buildAdditions(photoInput, state), /image already uses/);
});
test("new collection types are checked and names are stored without @", () => {
	for (const patch of [
		{ type: "photo" },
		{ type: "video" },
		{ type: null },
		{ name: "@walks", type: "photos" },
	])
		assert.throws(
			() =>
				validatePublish({
					...input,
					newCollection: { name: "walks", description: "outside", permalink: "mine", ...patch },
				}),
			AppError
		);
});
test("request budget accounts for base64 expansion and worst-case JSON Markdown escaping", () => {
	assert.equal(MAX_IMAGE_BASE64, Buffer.alloc(MAX_IMAGE_BYTES).toString("base64").length);
	const json = JSON.stringify({
		...photoInput,
		body: "\u0001".repeat(100_000),
		image: { base64: "A".repeat(MAX_IMAGE_BASE64) },
		imageAlt: "\u0001".repeat(4000),
	});
	assert.ok(Buffer.byteLength(json) < MAX_PUBLISH_BYTES);
});

test("accepts JPEGs at the advertised four-megapixel boundary and rejects larger images", () => {
	const bytes = jpeg.encode(
		{ width: 2000, height: 2000, data: Buffer.alloc(2000 * 2000 * 4, 128) },
		80
	).data;
	const files = buildAdditions(
		{ ...photoInput, image: { base64: bytes.toString("base64") } },
		photoSnapshot()
	);
	assert.deepEqual(Buffer.from(files[0].contents, "base64"), bytes);
	const oversized = Buffer.from(png);
	oversized.writeUInt32BE(4_000_001, 16);
	assert.throws(
		() =>
			buildAdditions(
				{ ...photoInput, image: { base64: oversized.toString("base64") } },
				photoSnapshot()
			),
		/4 megapixels/
	);
});
