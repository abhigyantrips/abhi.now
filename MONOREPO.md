# How should abhi.now, abhi.computer, and Chhotu live together?

> Migration status: implementation was authorized after the discussion below. All
> three apps now live under `apps/`, with shared root `content/`. Domains and
> independent Cloudflare deployments stay; Chhotu paths may change. Preserve
> Now's Git history and its public page/feed/sitemap coverage; retire `/embed`.
> See [README.md](README.md) for the current architecture, commands and cutover.
> The remaining text is the original discussion brief.

This is a starting point for a conversation with the next agent, not an agreed migration design. The direction is to bring these three projects into one repository. The folder structure, shared packages, rendering boundaries, tooling, and migration process still need discussion with me.

**The destination is this existing `abhi.now` repository.** I will make the changes here, bringing in `../abhi.computer` and `../Chhotu`. Do not assume a new fourth repository or a different GitHub repository name is wanted.

Start by inspecting the projects and asking me a few informed questions. Use the context below to identify decisions that actually affect the design. Do not treat illustrative suggestions from the previous discussion as settled requirements or begin moving projects just because this file exists.

## What led us here?

`abhi.now` is my main personal website. `abhi.computer` is a desktop-like website whose applications include some of the same content. `Chhotu` is an installable publishing app I made to make posting some of that content easier, currently snippets and photo snippets.

Computer initially displayed Now inside cross-origin iframes. I wanted the custom cursor to continue into those applications, their theme to follow Computer, analytics opt-outs to carry across, and links outside an application's scope to open separately. I also wanted the application's address bar to follow the current page while showing its public URL.

That led to static `/embed` variants on Now and a small messaging bridge for cursor CSS, theme, `annu.disabled`, and location reports. Links and header removal are handled in the generated embed HTML. The bridge and embed routes are implemented; inspect the current code rather than assuming they are still proposals. The earlier integration history is in `../abhi.computer/docs/abhi-now-embed-handoff.md`.

The discussion then exposed a simpler possibility: if both websites can read the same source content, Computer does not need to embed the running Now website at all. It can statically render that content inside its own application windows. The window can still look like a browser and show an “Open” link to Now, while its contents are ordinary HTML in Computer's document.

That would make cursor inheritance, theme, analytics preferences, and page location ordinary concerns of the Computer website, rather than cross-origin synchronization problems. Sharing the finished public HTML over HTTP is not the goal; reading shared Markdown/MDX, images, metadata, and appropriate rendering code during builds is the idea. Interactive content may still need JavaScript, but the simulated embedding itself should not require a bridge.

Chhotu then became a natural part of the discussion: it writes the content that the other two projects display. The emerging picture is one publishing-and-content system with multiple applications, rather than three unrelated codebases.

## What is decided, and what is only a working hypothesis?

The existing `abhi.now` repository is the home for the combined work. The intention is to bring all three projects together and explore replacing Computer's iframes for our own content with static rendering.

Separate public identities and deployments were the working assumption: `abhi.now`, `abhi.computer`, and `chhotu.abhi.now`. Confirm how I want that to work rather than automatically changing hosts, URLs, or deployment targets.

An `apps/` directory and shared content/rendering packages were suggested, as was a small pnpm workspace. These are possibilities, not a prescribed tree. It is not yet decided whether Now should remain at the repository root, whether content should move, how many packages are useful, or whether the public sites should be separate Astro projects or share more of one build system. There is no decision to adopt Turborepo, Nx, a CMS, a database, or a new publishing backend.

## Questions to start the conversation

Please ask a manageable first round, rather than making me answer every implementation detail at once. These seem like the most useful starting questions:

1. **How much should Now's existing structure change?** Should it stay at the root with the other applications alongside it, or should all three move beneath a common application directory?
2. **What should be shared besides the content?** Should Computer render the same article components and typography inside its windows, or should it have its own presentation of the shared content? Which parts of each site's current appearance and behavior must stay recognizable?
3. **Where should authored content live?** Should there be a dedicated shared content directory, or should Now continue owning the content with other applications consuming it? Computer also has its own journal, links, tech, and fields collections; should those remain specific to Computer or become available elsewhere?
4. **What migration experience do I want?** How important are preserving the imported projects' Git histories, keeping the old repositories usable during the transition, and keeping Chhotu publishing throughout the work?

Use my answers to propose a shape for the repository. Explain the tradeoffs before choosing directories or extracting packages.

## Details that should inform later questions

### Content, rendering, and navigation

Computer currently fetches Now's deployed RSS feeds during its build to create search entries and some deep-link routes. This can make a build depend on old deployed content rather than the checkout being edited. How should both sites obtain the same publication-filtered content and search metadata locally?

Now has custom content parsers, collection references, Markdown and MDX, images, social cards, and incremental-build behavior. Computer's local collections use a different content structure. Inspect these before proposing a generic shared schema or content package. Private drafts must not accidentally become public merely because another application can now read their source files.

For native Computer pages, how should internal links map between its local routes and Now's canonical public URLs? Should leaving an application's scope open a public page in a new tab, switch applications, or behave differently for different destinations? The earlier preference was to decide link attributes during static generation wherever possible.

Are Now's `/embed` routes still useful for consumers other than Computer, or should they eventually be retired? Their existence does not require the new architecture to keep using them. Discuss the transition rather than deleting working routes and bridge code immediately.

### Chhotu's publishing contract

Chhotu currently commits to `abhigyantrips/abhi.now` on `main`, under `src/content/snippets`. Those values are centralized in `../Chhotu/src/lib/config.ts`. Keeping this repository as the destination may preserve the repository target, but moving content would change the paths it reads and writes.

Its deployed Worker still needs to publish through GitHub even when the app's source is in this repository; it does not gain a writable checkout of the monorepo. Its collection list comes from fresh repository metadata, which is useful because a new collection should not require deploying the editor again.

What should the shared publishing contract cover: collection types and metadata, timestamps, paths, image frontmatter, publication rules, or preview rendering? Chhotu currently previews with `marked`, while Now renders with Sätteri. Do I want that difference addressed during this work or later?

Preserve the purpose of its existing safeguards when discussing changes: atomic image/Markdown/metadata commits, expected-HEAD checks, duplicate detection, retry recovery, and honest reporting of commit versus deployment success. A shared repository means unrelated code commits also advance HEAD, so ask how much publishing friction is acceptable and investigate that behavior rather than removing concurrency checks.

Chhotu also has installed clients, offline drafts, and a service worker that can leave an older editor open. How should API compatibility and content-path changes be rolled out? Keeping its current origin, PWA identity, and draft format was the suggested default, not an instruction to rebuild its authentication or storage.

### Tooling and deployment

At the time of this discussion, Computer uses Astro 6.4.6, Now uses Astro 7.3.1, and Chhotu uses Astro 7.4.0. Their Cloudflare/MDX integrations and TypeScript versions also differ. Recheck the manifests. Should versions be aligned as part of this work, or should repository consolidation and framework changes be separate decisions?

Now and Computer primarily generate public content statically. Chhotu has authenticated server endpoints as well as its PWA assets. Sharing a repository does not require sharing a runtime, credentials, service-worker scope, or deployment lifecycle.

What should a content-only publish rebuild? The likely answer is both reading sites, without redeploying Chhotu for every snippet, but the desired behavior needs confirming. Also discuss local development, deployment watch paths, independent rollbacks, and whether deployment coordination needs to be stricter than “both build the same commit.”

Now has a social-card/incremental-build compatibility integration and an image-processing Git hook. Chhotu has its own development instructions in `AGENTS.md`. These are existing workflow constraints to inspect, not incidental files to discard while reorganizing directories.

## How I want the next agent to approach this

Ground the discussion in the current code and my answers. Separate observed behavior, my decisions, and your recommendations. Prefer a small understandable structure, but do not force sharing where it makes the three applications harder to work on.

The earlier conversation included implementation when I was asking for an explanation. Be explicit about whether we are discussing options or have agreed to make changes. This document asks you to begin that conversation; it does not authorize publishing, deleting repositories, rewriting Git history, or committing to an unreviewed migration design.

The question to answer together is: **what is the simplest way for this existing abhi.now repository to own the content, publish it through Chhotu, and build both website experiences without treating one website as a remote dependency of the other?**
