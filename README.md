# abhi.now workspace

This repository owns Now, Computer, Chhotu, and their shared source content. Now's
existing Git history is retained; the other applications were imported as source
snapshots. The sibling repositories have not been changed.

```text
apps/now/       abhi.now — canonical public writing, feeds, sitemap
apps/computer/  abhi.computer — desktop and native content windows
apps/chhotu/    chhotu.abhi.now — authenticated publishing Worker and PWA
content/        shared Markdown/MDX, images, schemas, loaders, prose utilities
content/computer/  existing journal, links, tech and fields
scripts/        image-processing Git hook
```

Install with `pnpm install --frozen-lockfile` from this directory. The root
lockfile covers all apps. Each app retains its own Astro/Wrangler configuration,
runtime, environment files, deployment, and public origin. Keep secrets inside the
relevant application's ignored `.env` / `.dev.vars` files.

| Command                                                        | Action                                                            |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev:now`                                                 | Now on port 4321                                                  |
| `pnpm dev:computer`                                            | Computer on port 4322                                             |
| `pnpm dev:chhotu`                                              | Chhotu on port 4323; configure its local OAuth origin accordingly |
| `pnpm build`                                                   | Build all three apps independently                                |
| `pnpm build:now` / `pnpm build:computer` / `pnpm build:chhotu` | Build one app                                                     |
| `pnpm check`                                                   | Diagnostics for all three apps                                    |
| `pnpm format` / `pnpm format:check`                            | Write / check Prettier formatting                                 |

Chhotu's background development-server instructions are in
[its AGENTS.md](apps/chhotu/AGENTS.md). Existing local OAuth callbacks may use a
separate port; its app-local `pnpm dev` retains the normal Astro default.

## Content and rendering

Now and Computer load the same local collection definitions from
`content/collections.ts`. Both public Blog selections exclude unpublished posts.
Computer's existing collections remain under `content/computer/`; adding them to
Now's public routes is a future editorial decision. Authored image paths stay
relative to their Markdown files. Shared MDX refers to Now presentation helpers
through the explicit `@now/` alias, which both reader apps resolve identically.

Computer generates article, weeknote, snippet collection, facet and project pages
inside its desktop windows. It renders MDX and interactive components locally;
its search index reads the same checkout, without fetching Now's deployed feeds.
Its address and Open link still show the canonical public Now URL. Build-time
navigation keeps supported links within the current application local and sends
other destinations to their public URL in a separate tab. Ordinary full-page
navigation handles location and preferences; no iframe messaging bridge is used.
External media iframes authored in articles continue to work.

Now's `/embed` variants, receiver, transformation middleware and embed cache are
retired. Its normal pages, plaintext variants, feeds, sitemap and social cards
remain. Computer copies Now's public presentation assets into its generated
`public/now-assets/` directory in development and builds; it never fetches Now's
rendered public HTML. Prose utilities are shared in `content/prose.css`.

All three apps use Astro 7.4.11 and shared Astro integration and Tailwind versions
from the catalog in `pnpm-workspace.yaml`. Each app declares the packages it uses
with `catalog:`; update their shared versions in the catalog and regenerate
`pnpm-lock.yaml`. Astro belongs to the apps, not the workspace root.
Computer still imports Now's configuration and components directly, so a filtered
Computer install must include both `abhi-computer...` and `abhi.now...`.

## Cloudflare rollout

Keep all three existing Workers and domain bindings. In each Worker's Settings >
Build, connect `abhigyantrips/web` with production branch `main`. Set the root
directory to the application's directory so Cloudflare finds its Wrangler config:

| Worker / domain                   | Root directory  |
| --------------------------------- | --------------- |
| `abhi-now` / `abhi.now`           | `apps/now`      |
| `abhi-computer` / `abhi.computer` | `apps/computer` |
| `chhotu` / `chhotu.abhi.now`      | `apps/chhotu`   |

For all three, use this build command:

```sh
pnpm --dir ../.. install --frozen-lockfile && pnpm build
```

Use `pnpm exec wrangler deploy` as the deploy command. Set build variables
`SKIP_DEPENDENCY_INSTALL=true` (the build command installs the workspace explicitly)
and `NODE_VERSION=24`. The root `packageManager` field pins pnpm 10.29.3. Keep
runtime bindings and secrets on their existing Workers, including Chhotu's OAuth
credentials and session secret; its `APP_ORIGIN` remains `https://chhotu.abhi.now`.

These app roots supersede the earlier repository-root dashboard recommendation.
See Cloudflare's [monorepo setup](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
and [custom dependency installation](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/#skip-dependency-install).

Include these watch
paths for both readers: `content/**`, their own `apps/<name>/**`,
`apps/now/**` for Computer, `package.json`,
`pnpm-lock.yaml`, and `pnpm-workspace.yaml`. Chhotu watches `apps/chhotu/**` and
root package/workspace/lockfile changes; content-only commits need not redeploy it.
Both readers build the same content commit, with independent deploys and rollbacks.
Changing these hosted Git settings and deploying remain rollout steps; local
migration does not modify the Cloudflare account.

Switch Chhotu to this repository when deploying its new Worker. It still commits
to `abhigyantrips/web` on `main`, now under `content/snippets`. Its endpoints,
PWA origin/identity, authentication, draft format, atomic commits, duplicate and
retry recovery, and expected-HEAD checks are preserved. Installed editors submit
collection IDs and content, not repository paths, so the updated server supplies
the new paths without an editor protocol change. An old collections snapshot
gets the usual 409 and refresh if HEAD changed. Unrelated code commits still
require refreshing; concurrency protection has not been relaxed. During cutover,
stop publishing through the old Worker until the new code and paths are live.
A successful commit continues to be reported separately from deployment success.

## Formatting

Prettier remains the formatter for the three Astro apps, with their existing
Astro, TypeScript import-organizer and Tailwind plugins. Tailwind sorting uses each
app's stylesheet. Shared authored content, public assets and generated outputs are excluded from
bulk formatting. Oxfmt delegates Astro/MDX to
Prettier and cannot load the existing import-organizer plugin; consolidating does
not require changing formatting behavior. See [Oxfmt language support](https://oxc.rs/docs/guide/usage/formatter/language-support)
and [plugin limitations](https://oxc.rs/docs/guide/usage/formatter/unsupported-features).

The existing image hook continues to run from `.hooks/pre-commit` in this checkout.
Its portable source is now `scripts/pre-commit`. On a fresh checkout install it
with `mkdir -p .hooks && cp scripts/pre-commit .hooks/pre-commit && chmod +x .hooks/pre-commit`
and `git config core.hooksPath .hooks`. It preserves ICC profiles and orientation
while removing other EXIF data before staging images.
