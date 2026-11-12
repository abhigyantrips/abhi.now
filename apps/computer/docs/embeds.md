# Handoff: static `/embed` pages for abhi.now

## Goal and authorized scope

Implement dedicated, statically generated embed variants of abhi.now pages for the application iframes on abhi.computer. Reuse the existing content and visual styling, hide the website header, decide navigation attributes at build time, and include only the small runtime bridge needed to receive cursor CSS, theme, and analytics preferences from the parent.

This document is an implementation brief for an agent working on **abhi.now**. It does not authorize application-code changes to abhi.computer or deployment. The user has separately authorized keeping this handoff document up to date. Document remaining parent-side application changes so they can be implemented separately.

Preserve unrelated work and inspect both working-tree diffs before making changes. The earlier assumption that abhi.now contained a global `src/scripts/embedded-app.ts` receiver was not true of the inspected checkout. Its implemented receiver is now the embed-only `public/embed-bridge.js`; normal and plaintext pages do not load it. The parent already has a location-message receiver and unrelated in-progress changes that must be preserved.

## Decisions and constraints

| Concern                                | Build-time responsibility                                      | Runtime responsibility                                          |
| -------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| Content, routes and application scope  | Generate embed HTML and establish a fixed scope                | None                                                            |
| Header                                 | Omit it from the embed layout                                  | None                                                            |
| Link destinations and new-tab behavior | Resolve URLs, rewrite supported in-scope links, set attributes | Only exceptions for genuinely dynamic links                     |
| Cursor                                 | Include the embed-only receiver and a cursor style slot        | Receive trusted parent CSS and update the slot                  |
| Theme                                  | Include the embed theme mechanism                              | Receive and follow the parent's light/dark state                |
| `annu.disabled`                        | Include an embed-specific analytics gate                       | Receive the parent's flag before analytics can start            |
| Caching                                | Emit static files with the existing static hosting policy      | Personalize only the loaded document, never the cached response |

Static generation cannot know a visitor's parent localStorage or current theme. A small runtime bridge is necessary for those values; this does not require SSR, a framework island, a state-machine library, or runtime link scanning. Prerendering remains compatible with browser-side scripts. [Astro rendering documentation](https://docs.astro.build/en/guides/on-demand-rendering/)

## 1. Route contract

Use an **`/embed` suffix**, matching the existing `/plaintext` convention. The user confirmed this scope; Projects is excluded:

| Normal page              | Embed variant                  |
| ------------------------ | ------------------------------ |
| `/blog`                  | `/blog/embed`                  |
| `/blog/why-i-write`      | `/blog/why-i-write/embed`      |
| `/weeknotes`             | `/weeknotes/embed`             |
| `/weeknotes/2026/44`     | `/weeknotes/2026/44/embed`     |
| `/snippets`              | `/snippets/embed`              |
| `/snippets/folders`      | `/snippets/folders/embed`      |
| `/snippets/<collection>` | `/snippets/<collection>/embed` |
| `/whoami`                | `/whoami/embed`                |
| `/whoami/<facet>`        | `/whoami/<facet>/embed`        |

Whoami facets stay within the Whoami iframe; they must not open as separate public pages. As of 2026-11-11, production output covers 71 pages: 25 Blog, 36 Weeknotes, 5 Snippets and 5 Whoami (including four facets). Counts grow with selected content; they are not a hardcoded route limit.

Respect the site's existing trailing-slash handling. Generate index/list variants as well as detail variants, since applications initially open their index pages. Do not invent embed variants of feeds, image files, plaintext pages, or other non-page resources.

Create a shared route manifest mapping supported **canonical page paths** to embed paths and application scopes. Use it for generation, link rewriting, and validation. Only generate published blog posts in production, following the normal and plaintext routes' publication rules. Preserve the existing weeknote, snippet and Whoami-facet selection rules.

Each embed document has immutable build-time metadata, for example:

```html
<html lang="en" data-embed="computer" data-embed-scope="/blog"></html>
```

The parent must not be able to widen this scope by sending a different value. `/blog` and `/blog/...` belong to Blog; `/weeknotes` and `/weeknotes/...` belong to Weeknotes. These are separate applications, not a combined allowlist.

Keep canonical and social URLs pointing to the normal public page, excluding `/embed`. Exclude embed variants from the sitemap and add `noindex` metadata so they do not compete with normal pages.

## 2. Reuse content and layouts; keep scripts embed-only

The user requested route-local files rather than a shared `src/views/` directory or a centralized catch-all dispatcher. Keep these decisions:

- Each supported route directory contains `index.astro`, `_view.astro`, and `embed.astro` (plus `plaintext.astro` where applicable). Index and embed routes import the adjacent `_view.astro` relatively. Underscore-prefixed files are not routes.
- There are nine embed route files: Blog index/detail; Weeknotes index/detail; Snippets feed/folders/folder; Whoami index/facet. Content-driven siblings use `getStaticPaths()`; fixed index/list siblings are ordinary static routes. Flat pages were moved to directory/index form without changing their public URLs.
- `src/lib/embed-routes.ts` remains the common manifest for supported canonical paths, embed paths and application scopes. Route generation, link rewriting and validation use it.
- The existing page, reading, weeknote, about and facet layouts accept explicit build-time `embed` metadata. They render `EmbedHead` instead of `BaseHead`, omit only the site `<Header />`, and remove the associated top clearance. Preserve article titles and content headings.
- `src/components/embed-head.astro` owns the cursor style slot, `noindex` and the fixed public bridge asset. `document-head.astro` shares metadata/fonts/styles with `BaseHead`. The standalone theme code lives directly in `BaseHead` as inline scripts; do not introduce a separate theme JS file solely for this split.
- Keep footer markup and styling. Footer scroll-to-top/evil-eye controls and article PDF controls also initialize on document readiness, with duplicate-binding guards where needed, because embeds omit ClientRouter. Existing standalone router initialization remains supported.
- Shared `_view.astro` content preserves Markdown, raw HTML, MDX components, images, figures, fonts and interactions. Do not duplicate full pages or fetch the public website at runtime. A symlink to a public HTML file is unsuitable because the head, header, links and indexing metadata differ.

An explicit layout prop establishes mode, canonical path and fixed scope. Do not infer embedding mode from query parameters. The layouts choose appearance; the `embed.astro` siblings create routes; the URL policy does not create pages.

For embeds, suppress the ordinary localStorage/system-theme initializer and automatic analytics loader. Include a dedicated embed head/bridge instead. Regular and plaintext pages must not import or run that bridge.

**Astro caveat:** do not assume putting a processed `<script>` in a conditional expression guarantees conditional delivery. Astro bundles and deduplicates processed component scripts. Verify emitted HTML and browser requests for normal pages. A conditionally emitted `is:inline` script referencing a fixed public JS asset is one explicit option; it bypasses Astro processing, so the referenced asset must already be browser-ready JavaScript. A separate embed-only layout/head component is also useful, but its output still needs verification. [Astro script processing documentation](https://docs.astro.build/en/guides/client-side-scripts/)

Prefer ordinary document navigation on embed pages and omit ClientRouter there. This makes the small bridge restart predictably on each embedded document load. Audit existing interactions that listen only for `astro:page-load`: any controls retained in embeds must also initialize on initial document readiness, once. Do not silently break project filters/dialogs, PDF controls, snippet actions, or MDX interactions by removing the router.

## 3. Decide link behavior at build time

Implement one pure URL policy and apply it to **all rendered anchors** in embed pages: template links, Markdown links, raw HTML, MDX, figures, author links, list cards, and snippet content. A Markdown-only plugin or an `EmbedLink` component used by some templates is insufficient.

Implemented: retain the narrowly scoped `src/middleware.ts` HTML transform for embed routes, parsing with `parse5`. Colocated `embed.astro` files replace the route dispatcher, not this whole-document transform; removing it would lose policy coverage for Markdown/raw HTML/MDX anchors. Non-embed and unsupported routes pass through before HTML rendering/transformation. Astro middleware can inspect the rendered response; verify its prerender behavior in the installed Astro version and ensure the transformed HTML is what gets emitted. This should execute during static generation and local development, with no per-request production Worker requirement. If the installed pipeline makes that unsuitable, use a build integration over emitted embed HTML and provide equivalent dev behavior. Do not use regex to rewrite HTML. [Astro middleware documentation](https://docs.astro.build/en/guides/middleware/), [Astro build integration hooks](https://docs.astro.build/en/reference/integrations-reference/)

Resolve relative links against the **canonical source page**, using the site's actual normal-page URL/trailing-slash convention. Appending `/embed` changes relative URL resolution; do not accidentally resolve `../other-post` against the new suffix. Audit relative image/media/script/style URLs too, while leaving their resource types intact. Rewrite only anchors for navigation; do not treat `<link rel="canonical">` or feed metadata as clickable anchors.

Apply this policy:

1. **Fragment-only links** such as `#paragraph`: preserve them as same-document navigation.
2. **Same-origin, same-scope HTML pages with a manifest entry**: rewrite to the generated embed path and use the current iframe (`_self`). Preserve query parameters and fragments. Normalize absolute internal URLs to the correct current deployment origin where appropriate.
3. **Other applications or external HTTP(S) URLs**: open in a new tab with `target="_blank"` and merge `noopener noreferrer` into existing `rel` tokens. Keep the destination's normal public URL, rather than sending the new tab to an embed variant.
4. **In-scope links without an embed variant**, including `/plaintext`, XML feeds and other resources: open the normal destination separately. Do not create nonexistent `/feed.xml/embed` URLs or navigate the iframe to a normal page that loses embed mode. Preserve a useful existing `download` attribute where relevant.
5. **Already embedded destinations**: normalize idempotently; never append `/embed` twice. An embed URL from another app should open its normal public counterpart separately.
6. **Protocol handlers**, such as `mailto:` and `tel:`: preserve their normal behavior. Keep the site's existing content-safety rules for executable/invalid URLs; do not introduce new executable links as part of this feature.

Compare complete origins, not host substrings, and compare path boundaries, not a loose `startsWith('/blog')`. `/blogroll` is outside Blog. Normalize dot segments through URL parsing. Preserve intentional author-selected new-tab behavior for in-scope links unless it would target the parent/top window; prevent `_top`, `_parent`, or named targets from escaping the application shell.

Example output in Blog:

```html
<a href="/blog/why-i-write/embed#paragraph">Another post</a>
<a href="/weeknotes/2026/44" target="_blank" rel="noopener noreferrer">A weeknote</a>
<a href="https://example.com/" target="_blank" rel="noopener noreferrer">External site</a>
<a href="/blog/feed.xml" target="_blank" rel="noopener noreferrer">Feed</a>
```

The initial HTML must already behave correctly with JavaScript disabled. Do not scan or mutate all anchors on every load or intercept every click. If a retained component creates links dynamically, make that component use the same policy when constructing those links. This is a cooperative navigation policy, not a security boundary against arbitrary scripts, redirects, or user browser controls.

## 4. Embed-only runtime protocol

Keep the protocol small and versioned. Reuse the existing message names where practical, but coordinate the following additions with the parent agent:

```ts
// Child -> parent, after registering its receiver:
{ type: 'abhi.now:ready', version: 1 }

// Parent -> child, initially and whenever relevant settings change:
{
  type: 'abhi.computer:configure',
  version: 1,
  scope: '/blog',
  cursors: '/* complete cursor stylesheet with absolute asset URLs */',
  theme: 'dark', // 'light' | 'dark'
  annuDisabled: true // boolean: parent localStorage value equals 'true'
}

// Child -> parent, after applying a valid configuration:
{ type: 'abhi.now:configured', version: 1 }

// Child -> parent, after valid initial configuration and on current-URL changes:
{
  type: 'abhi.now:location',
  version: 1,
  href: window.location.href
}
```

Requirements:

- Listen only on `/embed` pages. Register before announcing readiness. The parent also sends on iframe load so early/late loading does not lose configuration.
- Require `event.source === window.parent`, an exact allowed parent origin, and valid message fields. Production allows `https://abhi.computer`. Development may explicitly allow `http://localhost:4321` and any documented alternate test origin; do not derive trust from arbitrary query parameters or accept every localhost port in production.
- Send messages with an exact target origin. Check or derive a trusted parent origin through the allowlist before replying; do not use `'*'`.
- Validate version, theme enum, boolean flag, CSS string, and scope. The advertised scope must match the document's build-time scope. Do not let untrusted messages partially configure the document.
- A full document navigation repeats the handshake. Browser back/forward cache restoration should announce readiness again on persisted `pageshow` so restored state does not retain an old parent theme or preference.
- A directly opened embed URL without a parent still renders readable content and static link behavior. It uses a sensible theme fallback and does not start analytics while parent configuration is unknown.

`postMessage` does not need CORS permission and does not grant cross-origin DOM or storage access. The receiver applies the accepted configuration inside its own document. [MDN postMessage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

### Window address synchronization (implemented on abhi.computer)

The parent now handles `abhi.now:location` messages. The embed bridge must send the actual absolute `window.location.href`, including its `/embed` suffix, query string and fragment, to the validated parent origin. Send it after applying initial configuration, on `hashchange`, on relevant `popstate`/persisted `pageshow`, and after any retained client-side router navigation. Full document navigation restarts the handshake and reports the new URL. The child implementation reports only after a valid versioned configuration, deduplicates unchanged URLs across hash/history events, and deliberately reports again on persisted restoration. Theme-only reconfiguration does not repeat an unchanged location. No-parent/no-configuration embeds send no location messages. Embeds currently retain no client-side router, so no router-specific listener or history-method patch is needed. Avoid accumulating duplicate listeners or polling.

The parent validates both the sender window and origin, version, reported URL origin and application path boundary. It strips only a terminal `/embed` (with an optional trailing slash), preserves query/fragment, and updates both the window's displayed URL and its “Open” link. During local development it maps the iframe origin back to the public `https://abhi.now` origin. It does not change the iframe's destination or the outer shell's browser history when receiving this message. The parent cannot obtain the current cross-origin iframe URL from the iframe element's `src` after internal navigation; these notifications are required.

## 5. Cursor CSS and theme

Accept cursor CSS only from the validated parent and replace the content of one dedicated `<style id="computer-cursors">` node using `textContent`, not HTML insertion. Update it idempotently. The parent must convert every cursor asset URL to an absolute URL on its own actual origin, including light/dark SVG and PNG fallbacks; `/cursors/...` would otherwise resolve against abhi.now.

The existing abhi.computer cursor stylesheet uses `:root[data-theme="dark"]`, while abhi.now themes through `html.dark`. Apply **both** representations when receiving theme:

```js
document.documentElement.dataset.theme = theme;
document.documentElement.classList.toggle("dark", theme === "dark");
document.documentElement.style.colorScheme = theme;
```

Do not write the parent theme to abhi.now's persistent standalone theme preference, and do not allow its ordinary system-theme listener to override embed configuration. Parent theme changes must update an already open iframe.

Preserve text/disabled cursor semantics and the stylesheet's pointer media query. Check specificity against Tailwind `cursor-pointer` and component styles rather than indiscriminately overriding every descendant with one cursor.

A parent theme cannot be known at static build time. A brief fallback paint before the handshake is possible. If eliminating that flash is required, coordinate a non-sensitive `theme=light|dark` initial URL hint, applied by a tiny early embed-only script, with the trusted message remaining authoritative. Do not put analytics opt-out or CSS payloads in URLs, and do not generate separate cached HTML for each visitor's settings.

If a CSP is present, the style insertion and cross-origin cursor assets must comply with its style/image directives. Do not weaken a site-wide CSP with `unsafe-inline` merely for this feature; report a conflict and use an appropriately scoped policy or a fixed approved stylesheet design. Broad CORS headers do not solve CSP or cross-origin DOM restrictions. Receiving full CSS deliberately trusts abhi.computer to style the embed; limit the contract to cursor styling and do not accept arbitrary script/stylesheet URLs from a visitor.

## 6. `annu.disabled` and analytics initialization

The iframe cannot read abhi.computer's localStorage. The parent reads the exact key `annu.disabled`, converts the value `'true'` to a boolean, and transmits it. Treat the received value as **embed-session configuration**, not as permission to modify the standalone site's persistent preferences.

Recommended policy:

```text
effectiveDisabled = parentDisabled OR abhiNowOwnDisabled
```

Read abhi.now's own flag defensively because storage may be blocked in an iframe. A false parent value must not erase an existing abhi.now opt-out. Do not persist a parent-derived opt-out into abhi.now's localStorage. The implemented embed bridge keeps that preference session-only; blocked child storage conservatively keeps analytics off. This avoids changing a later standalone visit merely because the user opened an application.

For embed pages:

1. Start with analytics blocked while waiting for valid parent configuration. No analytics script, pixel, heartbeat, or pageview request should run first.
2. After configuration, start analytics at most once and only if the effective flag permits it. If no handshake arrives, keep analytics disabled; content stays readable.
3. On a later opt-out, stop future analytics activity. Check the actual Annu API for supported disable/teardown behavior. Removing a loaded `<script>` or setting a flag does not remove its existing timers/listeners or undo an already sent request. If Annu cannot stop safely, coordinate an iframe reload with an initial disabled state and keep analytics blocked until configuration arrives. Report that limitation explicitly.
4. Scope this gate to embeds. Normal pages should keep their independent analytics preference and normal initialization behavior.

The inspected Annu 0.1.0 client checks `annu.disabled === 'true'` before sending requests, as the user pointed out. It does not expose a disable/teardown API. The child therefore reloads on a later effective opt-out, suppresses unload analytics during that transition, and begins the next document blocked pending configuration. Writing the parent flag into child storage would alter later standalone visits and is intentionally avoided. Already-sent/in-flight requests cannot be undone. Standalone initialization separately skips loading Annu when its own opt-out is set.

The parent must notify the iframe when its own UI changes the value. A `storage` listener alone is insufficient: that event fires in other documents sharing the storage area, not in the document performing the write. Also handle relevant cross-tab changes. [MDN storage event documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)

## 7. Static generation, incremental builds and HTTP caching

Use `getStaticPaths()` and the same prerendering model as the existing plaintext siblings. Emit ordinary static HTML; do not set `prerender = false` or add request-time rendering to receive runtime preferences. Verify actual output files and that Cloudflare serves them as static assets.

Reuse content digest keys where appropriate, but account for every input that changes embed output. Listing pages depend on all relevant entries; link rewriting depends on the embed route manifest and publication status. For example, publishing or removing the target of a link can change its rewrite even when the linking article's digest is unchanged. Confirm the installed incremental-build dependency behavior and include the necessary manifest/policy dependencies or explicitly invalidate the affected outputs. Also verify shared layout/transform changes invalidate existing embed HTML.

Implemented cache behavior: 66 content-driven embed pages have keys combining their entry/folder post digests, route manifest, tag digests, build year and middleware/HTML-transform/policy sources. The five fixed index/list pages render every build. Astro additionally tracks imported layouts, scripts, styles and rendered MDX dependencies. Public/plaintext blog keys include referenced tag digests, and cached card-dependent pages include the copyright year where rendered.

A build-only compatibility integration, `src/integrations/stable-card-cache.ts`, handles astro-cards 1.0.1 injecting a random collector port into prerender module code. It uses a stable placeholder for dependency hashing and inserts the real URL into executable chunks afterward; the temporary server keeps its OS-assigned port. The later build hook restores referenced social-card files for reused HTML, since skipped pages never call `renderCard()`. Missing cached images or an upstream module-format change fail explicitly; a forced build regenerates missing cards. No dependency files, production server ports or runtime navigation are patched. This local workaround has not been filed upstream.

Measured warm-build comparisons on the same machine, three timed runs after a warm-up with existing asset caches retained: centralized/no keys 9.88s; colocated/no keys 9.50s; centralized/keyed 9.59s; colocated/keyed 9.53s. The small differences did not establish a routing-structure speed advantage; colocation was retained for maintainability. Before the card workaround, only four facet embeds reused HTML. After the workaround and cache-input fixes, the final measured runs were 6.43s, 6.04s and 5.88s (mean 6.12s), reusing all 66 keyed embed pages and preserving all 63 distinct local social-image references. These historical 2026-11-11 measurements are not cold-build or deployment timings, nor a guarantee for later changes.

Match the current HTTP cache policy used for plaintext HTML and existing hashed assets. Static generation, incremental build reuse, and CDN/browser caching are different concerns. Do not assume a `cacheKey` sets an HTTP Cache-Control header, and do not make mutable page URLs immutable forever. Cursor/theme/opt-out values must not enter stored HTML, build keys, or shared cache variants.

Preserve the existing frame permissions if embedding already works. If deployment headers restrict framing, allow the specific computer origin on embed routes; do not broadly relax framing or CORS on normal pages. Verify CSP and frame headers on real responses, including redirects.

## 8. Parent-side implementation

The user subsequently authorized the abhi.computer agent to finish the parent application. Implemented locally:

- Supported applications now load the corresponding `/embed` page while keeping the displayed address and “Open” link canonical. Projects stays on its normal URL and does not receive embed configuration.
- Configuration includes `version: 1`, current `theme`, absolute cursor stylesheet URLs, `annuDisabled`, and explicit scope metadata. Versioned ready/configured messages are validated against both the iframe window and its origin. `data-embed-state` records whether the child has acknowledged configuration.
- A root theme-attribute observer sends updates to the open iframe. The control panel's Analytics toggle writes the preference through `setAnalyticsDisabled()` in `src/scripts/preferences.ts`, which dispatches `abhi.computer:preferences-changed` for same-tab updates. Native storage events propagate cross-tab changes. Application cleanup removes listeners and disconnects the observer; there is no polling or monkey-patching of storage methods.
- The existing `abhi.now:location` receiver retains its URL/sender/version/scope validation and canonical display/Open mapping. Parent pageshow sends fresh settings after restoration.
- Whoami is exposed in the launcher at `/whoami`; child facet navigation stays in the Whoami iframe. Its icon reuses the existing information icon asset.
- Development uses parent `http://localhost:4321` and child `http://localhost:4322`, with `PUBLIC_ABHI_NOW_ORIGIN` available for an alternate child origin. Production defaults to `https://abhi.now`. Canonical display remains on the public origin even during local testing.

These parent changes replace the earlier unversioned configuration and unsuffixed iframe destinations. They do not require further child application changes. The parent agent has not modified abhi.now application sources or deployed either site.

Both new ends must be running together for runtime features to work. A parent-only deployment cannot make an old child accept new messages. Static link behavior and header removal should still work without the parent bridge.

## 9. Acceptance checks and handback

### Build and static HTML

- Run the repository's type/diagnostic check and production build; test representative blog MDX, weeknote, snippet, Whoami/facet and index variants.
- Verify embed files exist, publication rules match normal pages, and canonical/noindex/sitemap behavior is correct.
- With JavaScript disabled, verify the site header is absent and link destinations/targets already implement the policy. Test `/blogroll`, cross-app links, absolute internal links, fragments, query parameters, relative links, plaintext/feed links, and repeated transformation.
- Verify normal and plaintext pages have no embed bridge script or embedding-specific initialization. Inspect generated output and network requests rather than relying on the source-level conditional.
- Verify incremental rebuilds after changing content, publishing a target, and changing shared embed layout/policy inputs.

### Real two-origin browser integration

- Run both actual local HTTP servers. Do not substitute local HTML for production origins and present that as a deployed integration check.
- Verify default/click/text/disabled cursors, both themes, and absolute cursor asset requests. Toggle parent theme while the iframe is open.
- Verify in-scope navigation stays on generated embed pages; cross-app/external links open separately with no opener. Verify version-1 location messages contain the actual child origin, `/embed`, query and fragment, while the parent address/Open link shows the canonical public URL. Test initial configuration, document navigation, hash/history changes, reload and persisted restoration, plus required content interactions.
- Set parent `annu.disabled` before loading: verify zero analytics requests. Verify same-tab and cross-tab updates, the child's independent opt-out, blocked storage, and no-parent/no-handshake behavior.
- Verify unrelated parent origins, sibling frames, mismatched scope, invalid fields and unsupported protocol versions cannot configure the embed.
- Check actual hosting headers and caching when deployed; distinguish local validation from deployment verification.

Hand back a concise list of files changed, generated route coverage, protocol details, validation results, parent-side work required, and any unresolved Annu/CSP/cache limitations. Do not deploy as part of this handoff unless separately instructed.

## 10. Current validation and remaining integration work

The child diagnostics/build and whole-output audits cover all generated embeds, normal/plaintext bridge isolation, canonical/social metadata, noindex/sitemap rules, static anchor/resource policy, social-image existence, and referenced tag descriptions. Rebuild probes exercised changed content, publishing a link target without changing the source article, changed shared head/policy, changed card templates, restored inputs and a forced full build. Browser checks previously used actual local parent/child servers with parent-page instrumentation to supply the proposed versioned contract; they were not deployed integration tests.

The local Astro 7.3.1 + Cloudflare/workerd development runner can intermittently produce `Unexpectedly unable to find a component instance for route ...`, including on ordinary pages. This matches [astro#17922](https://github.com/withastro/astro/issues/17922); local browser checks may need failed-GET retries. Static production-output validation is independent of that dev-runner behavior.

The full parent contract and `/embed` destinations have since been implemented as recorded in section 8. The historical instrumented checks below predate that work. Actual browser BFCache behavior and deployed CSP/framing/cache behavior still require their own checks; local validation must not be described as a deployment.

### Location-reporting validation (2026-11-11)

Before the user requested test removal, six policy/bridge tests and four static-output tests passed, along with diagnostics and two consecutive production builds. The test files and package scripts were subsequently removed before pushing; these are historical validation results, not an available suite. Use `pnpm check`, `pnpm build` and manual integration/output checks unless tests are reintroduced. The second build reused all 66 keyed embed pages, retained all 71 outputs and passed the social-image audit. The middleware remains necessary for whole-document anchor/resource rewriting; its non-embed/unsupported-route guards now run before rendering, and an obsolete test-only development-placeholder replacement was removed.

A real two-origin browser test used the actual parent on `http://localhost:4321` and child on `http://localhost:4322`. Parent-page test instrumentation supplied the missing versioned configuration; the existing parent application receiver updated both displayed address and Open link correctly for initial query/fragment, full document navigation, hash changes, deduplicated fragment back navigation, query-history traversal and reload. Reported hrefs retained the actual child origin and `/embed`; the displayed/Open URL used `https://abhi.now` without the suffix. Outer shell history was unchanged, analytics stayed blocked, and there were no browser script errors. Three failed dev-server GETs were retried for the documented workerd issue. Persisted-pageshow reporting, no-referrer handshake, invalid messages and no-parent behavior also passed the implementation-time unit checks; actual browser BFCache restoration remains a separate integration check.

Only this documentation file changed in the sibling repository. Its pre-existing application changes were preserved; no deployment was performed. Because the real parent still sends the older configuration, the instrumented browser result must not be described as completed automatic parent/child integration.

## 11. Parent completion and validation (2026-11-11)

The parent application changes in section 8 are now complete. All 14 parent tests and its 94-page production build pass. A browser check using the actual production output from both repositories as HTTP response fixtures under their respective production origins passed the automatic handshake for all four supported applications, Whoami facet navigation, parent theme changes and dark cursor styling, canonical address/Open updates across document/hash/history changes, same-tab analytics changes and opt-out reload, cross-tab preference propagation, independent child storage, and the Projects exception. It injected no configuration messages and substituted no bridge code. Analytics endpoints were stubbed to avoid recording test visits; this verifies loading/gating/reload behavior, not Annu's backend delivery. There were no browser script errors. This is production-build integration validation, not a deployment check.

The actual local servers were also exercised without configuration instrumentation. The first valid Blog handshake succeeded after restarting the child dev process, but the documented Astro/workerd component-instance error then returned persistent HTTP 500s for other routes (and subsequently Blog), despite failed-GET retries. That prevents claiming a complete local development-server integration pass. The server was restarted once; no sibling application sources were changed. Fixing that existing dev-runner issue and validating deployed headers remain separate work.

A standalone parent `tsc --noEmit --skipLibCheck` check still reports existing missing declarations/module resolution issues for rehype-figure, an Astro component and shiki, plus nullable `search` in `computer.ts`. No diagnostics remain in the changed TypeScript files. These unrelated type-check issues were not folded into the embed work.
