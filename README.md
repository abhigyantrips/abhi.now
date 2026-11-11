# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Snippet collections

Each folder in `src/content/snippets/` has an `_collection.json` containing
`name`, `description`, `permalink`, and `type` (`"text"` or `"photos"`). Omitted
`type` values default to `"text"`. The collection controls every post's type;
individual posts do not need their own `type` field.

```json
{
  "name": "out-and-about",
  "description": "things i saw while being out in the world.",
  "permalink": "out-and-about",
  "type": "photos"
}
```

Posts keep their unique 10-digit Unix timestamp filenames. Text posts are ordinary
Markdown. In a photo collection, each post requires a local `image` and nonempty
`imageAlt` in its frontmatter. Image paths are relative to the Markdown file;
`imageAlt` describes the image for accessibility, independently of the caption.
The Markdown body is the optional caption; don't repeat the main image in it.

```md
---
image: ./images/evening-walk.jpg
imageAlt: Sunlight falling across trees beside a walking path.
---

I just remember my legs hurting from the exertion.
It was an amazingly extroverted day.
```

Photos preserve their aspect ratios. They use 60% of the feed width from the `md`
breakpoint, alternating left and right among photo posts only, and the full feed
width on mobile. The same presentation applies to the mixed feed and folder
pages. The collection name links to its folder; the datetime links to the post.
RSS includes the frontmatter image before the caption, and photo folders have
photo previews in their social sharing images.

## abhi.computer embeds

The statically generated `/embed` siblings cover Blog (including published posts),
Weeknotes, Snippets (feed, folders index and each folder), and Whoami (including
facets). `src/lib/embed-routes.ts` is the shared route manifest. Shared views live
beside each route as `_view.astro`; regular and embed routes import the same
component relatively. Underscore-prefixed files do not become routes. Flat pages
with shared views use a directory and `index.astro` (for example,
`snippets/folders/index.astro` and `snippets/folders/_view.astro`). `EmbedHead`
shares metadata/fonts/styles with `BaseHead` through `DocumentHead`, but includes
only the embed bridge. It omits the standalone router, theme initializer and
automatic analytics loader. Layouts omit the site header and its top clearance;
article headings and the footer remain.

`src/middleware.ts` transforms complete embed HTML with parse5 during prerendering
and development. `src/lib/embed-policy.ts` decides every anchor's behavior:
supported pages within the fixed application scope remain embedded; cross-app,
external, feed, plaintext and unsupported destinations open separately with
`noopener noreferrer`. Author-selected `_blank` is retained; parent/top/named
targets cannot escape the shell. Fragment-only links remain fragments. Relative
links and resource URLs resolve against the canonical page's trailing-slash URL,
not the embed suffix. Resource `srcset` and CSS `url()` values use dedicated
parsers. No runtime anchor scan or click interception is needed.

The output is ordinary static HTML under `dist/client/**/embed/index.html`, with
canonical/social URLs pointing to public pages, `noindex`, and sitemap exclusion.
The browser-ready `/embed-bridge.js` is a fixed public JavaScript asset. Neither
requires a production Worker to customize responses. Each route directory has its
own `embed.astro`, importing the adjacent `_view.astro`; there is no centralized
catch-all or page-type dispatcher. The four content-driven routes use
`getStaticPaths()` and explicit cache keys. The five fixed index/list routes
render every build.

`src/lib/embed-cache.ts` combines the build year, route manifest, tag digests, and the HTML
middleware/transform/policy sources with each entry's digest. Folder keys include
all posts in that folder. Astro also tracks imported layouts, styles, scripts,
and rendered MDX dependencies. Publishing/removing a target changes the manifest
and invalidates cached navigation even when a linking article did not change.
This is independent of HTTP caching; no cache or framing headers change.

### Parent implementation required (separate repository)

1. Point application iframes at `/embed` destinations, including Whoami/facets,
   while retaining canonical public URLs for the browser bar's Open action.
2. Register the parent's message listener before loading the iframe, and send configuration both on
   iframe `load` and on `{ type: "abhi.now:ready", version: 1 }`. Validate child
   messages using the exact iframe window and expected child origin; clean up
   listeners when closing or changing applications.
3. Send this entire object initially and on relevant changes:

   ```js
   {
     type: "abhi.computer:configure",
     version: 1,
     scope: "/blog", // /weeknotes, /snippets or /whoami, fixed for each app
     cursors: "/* complete cursor CSS */",
     theme: "dark", // or "light"
     annuDisabled: localStorage.getItem("annu.disabled") === "true"
   }
   ```

   Read storage defensively. Include absolute cursor asset URLs on the actual
   parent origin, including dark/light SVG and PNG fallbacks. Preserve pointer
   media queries, text/disabled semantics, and the parent's targeted `!important`
   cursor declarations so component cursor styles cannot override them. The child
   sets `html.dark`, `data-theme`, and `color-scheme`, and replaces the single
   `#computer-cursors` stylesheet through `textContent`.
4. Treat `{ type: "abhi.now:configured", version: 1 }` as acknowledgement. The
   child's build-time scope is immutable. Invalid origins, senders, versions,
   scopes or field types cannot partially update the document. Messages use exact
   target origins, never `"*"`. The parent sends even if referrer policy prevented
   an initial ready message. Listen for theme changes, same-tab preference writes,
   and other-tab `storage` events; a storage listener alone misses same-tab writes.
5. In development, use parent `http://localhost:4321` and child
   `http://localhost:4322` (`pnpm dev --port 4322` here). Only development output
   accepts the explicit parent localhost origin; production accepts only
   `https://abhi.computer`. No arbitrary localhost ports or URL-derived trust.
6. Each full navigation repeats the handshake. A persisted `pageshow` announces
   readiness again. If analytics was already running, restoration reloads into
   the default blocked state before accepting fresh settings. The parent should
   keep its existing location receiver: the child sends
   `{ type: "abhi.now:location", version: 1, href: window.location.href }` after
   valid configuration, on hash/history changes and on persisted restoration.
   The href includes `/embed`, query and fragment; the parent strips only the
   terminal suffix for its displayed canonical address and Open link. Unchanged
   locations are deduplicated, except restoration/initial configuration.

### Analytics and hosting limits

Embed analytics stays blocked until a valid parent configuration arrives. It
starts at most once per document if both the parent and child's independent
`annu.disabled` preferences permit it. Blocked child storage conservatively keeps
analytics off. A direct embed URL or missing handshake renders content without
analytics. Parent preferences never write the child's localStorage or theme key.

The inspected Annu 0.1.0 client checks localStorage `annu.disabled === "true"`
before sending events, but exposes no disable/teardown API. Writing that key would
persist the parent preference into later standalone visits. Instead a later
parent opt-out reloads the embed; unload analytics listeners are suppressed and
the new document waits for configuration. Already-sent or in-flight requests
cannot be undone. Existing child opt-outs always win over a false parent flag.
Normal pages retain their own analytics initialization and now skip loading the
script when their own opt-out is already set.

The live `/blog` redirect and `/blog/` response inspected on 2026-11-11 had no CSP
or framing restrictions; HTML used `public, max-age=0, must-revalidate`. No broader
CORS/framing policy is added. New embed deployment headers, redirects and caching
must still be checked after deployment. A future CSP must explicitly account for
the cursor style slot and approved cross-origin cursor images; do not weaken the
site-wide policy as a workaround. No deployment is included in this change.

### Validation and build timing

Run `pnpm check` and `pnpm build`. The automated test files and package scripts
were removed at the user's request before pushing. The validation results below
record checks completed during implementation; they are not an available test
suite. Future bridge/navigation and generated-output checks must be performed
manually unless tests are reintroduced.

The initial rollout timings below use three consecutive wall-clock `pnpm build` runs on the same
machine, retaining the repository's existing incremental/content/image/card
caches. These are repeated cached builds, not clean builds or deployment times.

| Run | Before (seconds) | After (seconds) |
| --- | ---: | ---: |
| 1 | 10.42 | 9.41 |
| 2 | 8.44 | 9.37 |
| 3 | 7.63 | 9.51 |
| Average | 8.83 | 9.43 |

The measured increase is 0.60 seconds (6.8%), including regeneration of all 71
embed documents: 25 Blog, 36 Weeknotes, 5 Snippets and 5 Whoami. Run-to-run variation
and pre-existing caches limit the precision of the comparison.

Known local development limitation: this checkout's Astro 7.3.1 and Cloudflare
workerd combination can intermittently return empty/500 responses with
`Unexpectedly unable to find a component instance for route ...`, affecting both
ordinary and embed pages. This matches the upstream report
[astro#17922](https://github.com/withastro/astro/issues/17922). Browser validation
uses the actual local servers with failed GET retries; this is distinct from
static output validation and is not evidence of a deployed integration test.

Runtime validation used real parent `http://localhost:4321` and child
`http://localhost:4322` servers, with parent-page instrumentation sending the new
protocol (the sibling application code was not changed). Theme updates, absolute cursor
URLs and default/click/text/disabled cursor semantics, MDX article navigation,
Whoami facet navigation, PDF controls, direct/no-handshake embeds, and analytics
load/reload gating passed without browser script errors. The Annu test used the
captured served client with only its domain restriction adapted for localhost;
collection requests were intercepted, not sent to the production collector. A
later opt-out produced no additional requests over the 27-second check and did
not persist the parent preference into child storage.

The implementation-time unit checks covered blocked storage, child opt-out,
invalid messages, sibling senders, and persisted pageshow readiness. Automatic same-tab/cross-tab parent
notifications and real browser-history restoration across both finished ends
still need the parent implementation. Deployment framing/CSP/cache checks also
remain separate.

With JavaScript disabled, the five application/listing pages and Whoami facet
navigation passed against the local server. A separate browser context confirmed
that normal pages retain their header and working theme toggle, omit the bridge,
and make no Annu request when their own opt-out is set. A parent served from the
untrusted `http://127.0.0.1:4321` origin could not configure the child.


### Centralized versus colocated route benchmark

A separate comparison measured all four configurations on 2026-11-11. Each had
one unmeasured warm-up build followed by three timed wall-clock `pnpm build`
runs, with the same 71 output routes, dependencies and asset caches. The dev
server was stopped throughout. "Keyed" uses equivalent per-entry/folder keys;
the five fixed index/list routes were left unkeyed in both forms.

| Route structure | HTML keys | Runs (seconds) | Mean | Embed HTML reused per build |
| --- | --- | --- | ---: | ---: |
| Centralized catch-all | None | 9.87, 10.38, 9.38 | 9.88s | 0/71 |
| Colocated files | None | 9.50, 9.32, 9.67 | 9.50s | 0/71 |
| Centralized catch-all | Enabled | 9.65, 9.30, 9.81 | 9.59s | 0/71 |
| Colocated files | Enabled | 9.70, 9.85, 9.04 | 9.53s | 4/71 |

These small differences overlap run-to-run variation; the measurements do not
establish a meaningful build-speed advantage for either route structure. The
colocated version is retained for simpler file-based routing and local imports.
Cache keys are supported by either structure, not a special ability of separate
`embed.astro` files.

The comparison exposed a limitation in installed `astro-cards` 1.0.1 (handled by
the local workaround below):
its prerender virtual module includes a collector URL with a newly allocated
localhost port each build. Astro hashes this dependency, so card-dependent pages
receive different dependency hashes even when content and cache keys are
identical. Consecutive cache manifests confirmed this for Blog, Weeknotes and
Snippet folders, including existing public pages. With separate routes only the
four facet embeds reused HTML; the centralized route imports all views, so that
unstable dependency invalidated every keyed path there. Card/image asset caches
still worked. No dependency patch or framework change was made as part of this
comparison.


### Local workaround for astro-cards incremental caching

`src/integrations/stable-card-cache.ts` is registered after `cards()` in the Astro
config. It applies only to builds and makes the prerender collector URL stable
while Astro hashes module dependencies. A Vite transform replaces the temporary
URL with a fixed placeholder; `renderChunk` substitutes the actual build's URL
into executable output afterward. The server still uses an OS-assigned port,
works across processes, and closes normally. Its address is not used in client
HTML. Development and deployed on-demand card rendering retain their existing
behavior. No package files or fixed server ports are patched.

Reusing HTML skips `renderCard()`, so the upstream integration otherwise has no
record of those pages' card images to emit. The later build hook reads final
social-image metadata and copies only referenced missing card files from the
existing card cache into the output assets. It fails with an actionable
`pnpm astro build --force` message if a referenced cached image is missing,
rather than silently emitting broken social links. The virtual-module transform
also fails explicitly if the upstream collector format changes. This is a
version-specific compatibility workaround for the installed astro-cards 1.0.1,
not an upstream fix; remove it once the dependency handles both stable hashing
and asset restoration for skipped pages.

Enabling real reuse exposed incomplete existing public/plaintext blog keys:
they omitted referenced tag descriptions. Those keys now include referenced tag
digests. Cached Blog, Weeknote and Snippet-folder outputs also include the build
year where their footer prints it. Embed keys already covered these inputs.

After an untimed populated-cache build, three consecutive builds of the final
implementation took **6.43s, 6.04s and 5.88s**, averaging **6.12s**. The prior
colocated/keyed benchmark averaged **9.53s**; the observed reduction is **35.8%**.
These are warm-build wall times on this machine with asset caches retained,
not clean-build or deployment timings. All three builds reused **66/71 embed
HTML files** (the five fixed listing/index routes render each time), retained
stable dependency hashes, and restored the 62 generated card images. The
output audit verified all 63 distinct local social-image references exist.

Before test removal, validation passed diagnostic checking, six policy/bridge
tests and four static-output tests. Rebuild probes verified article-title edits refresh public
and embed HTML plus their generated card; changing only the card template
invalidates the HTML and image; tag-description edits refresh public, embed and
plaintext pages; restoring those inputs restores their output; and a forced
full HTML build succeeds with the actual temporary collector. Test mutations
were restored. No deployment or upstream issue/PR was made.


### Location notifications to abhi.computer

The embed-only bridge reports `{ type: "abhi.now:location", version: 1,
href: window.location.href }` after valid configuration, on native hash/history
changes and on persisted pageshow. Hrefs retain the actual iframe origin, embed
suffix, query and fragment; the parent performs canonical display/Open mapping.
Unchanged URLs from overlapping popstate/hashchange events are deduplicated;
restoration and a fresh document handshake report again. No parent or missing
configuration produces no location report. Embeds have no retained ClientRouter,
so no router listener, history-method patch, click interception or polling is
added.

A real local parent/child browser check verified initial URL reporting, document
navigation, fragment/query history, deduplication and reload. The parent address
and Open link updated while outer shell history stayed unchanged. The test
instrumented the parent page to send the required versioned configuration: its
application source still lacks version/theme fields and embed destinations.
The sibling handoff at `../abhi.computer/docs/abhi-now-embed-handoff.md` records
these remaining tasks and the user-confirmed route/head/cache decisions. Only
that document was edited there.
