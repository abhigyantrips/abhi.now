# abhi.computer revamp

This file records the agreed direction and distinguishes it from proposals that
still need a decision. Update it as decisions change. The icon/cursor trial and
color-only taxonomy are implemented. The first operating-system shell iteration is
implemented on the homepage.

## Purpose

- `abhi.now` remains the main publishing site for writing, including Blog and
  Weeknotes.
- `abhi.computer` is Abhigyan's personal computer on the web: a place to explore
  things he saves, makes, and tries.
- Use an operating-system-like interaction model with an original appearance.
  Borrowing familiar interactions does not mean copying an existing OS's styling.

## Confirmed interface structure

- The homepage opens to an application launcher: a searchable application grid,
  conceptually similar to the macOS applications screen.
- A Start/application-launcher button sits at the bottom left. It is active by
  default because the launcher is initially open.
- Clicking the active Start button dismisses the launcher and reveals the
  wallpaper, with the persistent navigation still available.
- The right edge holds permanently visible favorite-application shortcuts.
  Initial examples are Journal, Blog, Weeknotes, and Projects.
- Applications open in a fixed workspace beside the right-hand shortcuts and
  above the bottom taskbar. Windows are not draggable or stackable.
  Only one application window is visible at a time.
- The taskbar sits beside Start and shows the currently open applications.
  Persist the open-application list in `localStorage`.
- Put the date and time at the bottom right.
- Blog and Weeknotes have separate taskbar entries and separate browser-style
  application windows, even if they share a window component internally.
- Example applications are sufficient while developing the shell.

The three main views are the launcher, the wallpaper/desktop, and the active
application. The right-hand shortcuts and bottom taskbar remain available across
these views.

## Content and applications

- Combine the current technical posts (Things) and saved Links into a
  **Tinkering Journal** application.
- Technologies/tags and Fields belong to this journal as ways to organize and
  explore its content, rather than independent top-level applications.
- Technologies/tags and Fields have no icons. Identify them with theme colors,
  using brand colors where a relevant brand exists and assigned colors otherwise.
- Blog and Weeknotes open their existing `abhi.now` pages inside iframes with a
  browser-style frame. Their content continues to live on `abhi.now`.
- Projects is a favorite application embedding `https://abhi.now/projects`.
- Snippets is an application embedding `https://abhi.now/snippets`.
- Leave room for individual experiments, tools, and collections to become
  applications. A complete application inventory is not required yet.
- Settings is a desired application for choosing a wallpaper. Its detailed
  controls are not finalized.

## Search

- Launcher search should find applications and individual content entries.
- Include the local Tinkering Journal plus Blog and Weeknotes from `abhi.now`.
- Use the existing RSS feeds as the external content source:
  - `https://abhi.now/blog/feed.xml`
  - `https://abhi.now/weeknotes/feed.xml`
- Search matches titles only. Descriptions and article bodies are excluded from
  matching and from the exported index. Results show title, application, and date.
- Include `https://abhi.now/snippets/feed.xml`; preserve fragment permalinks when
  opening individual snippets.
- No filesystem symlink or new cross-site search export is needed. Pagefind was
  suggested earlier; it has not been selected and should not be treated as a
  dependency.
- A content result should identify its owning application and destination URL,
  allowing it to open the matching journal page or embedded article.
- RSS ingestion now runs at build time and emits a static search index, avoiding
  browser CORS requirements. External results refresh when the site rebuilds.
- The browser loads the index on the first search and keeps it for the session.
  Search matches all query terms across titles and bodies, prioritizes title
  matches, and then sorts by date. Results show their owning app and an excerpt.

## Technical boundaries

- Keep Astro and statically built content.
- Basic client-side JavaScript is expected for search, the clock, application
  switching, taskbar state, persistence, and settings.
- A shared layout can own the computer shell and its client-side controller.
- No application backend has been requested for this phase.
- Keep the two sites' content ownership separate; embedding and RSS connect them.
- Discuss implementation details directly. The user built both sites and is
  comfortable with technical explanations.

Implementation proposals discussed, but not yet finalized:

- An application registry describing IDs, titles, icons, favorites, and native
  routes or iframe destinations.
- Keeping opened iframes mounted while switching windows to retain their live
  state and scroll position.
- An origin-checked `postMessage` bridge if the shell needs to track navigation
  or titles inside `abhi.now` iframes.
- Preserving native content permalinks and ordinary browser navigation.

## Appearance and icons

- The visual design remains open. The earlier interactive mockup explored
  behavior; its appearance is not an approved design direction.
- Use less filler: the launcher primarily needs search, icons, and application
  labels. Extra taglines, descriptions, badges, and instructional copy have not
  been requested.
- Use **Streamline Plump Remix Free** for the initial icon trial. The user chose
  Streamline's Remix Free after the Plump recommendation. These combine linework
  and filled areas. This selection applies to applications and interface controls,
  not journal tags or Fields.
- Use custom cursors from the same family: `arrow-cursor-1-remix` for normal
  pointing, `one-finger-tap-remix` for clickable controls, and `hourglass-remix`
  for asynchronous busy states. Retain native text and disabled cursors.
- The trial uses CSS cursor assets with explicit hotspots and PNG/keyword
  fallbacks. Actual busy states should follow pending work, without artificial
  loading delays. Cross-origin iframes need their own matching cursor styles.
- Selected icon paths come from the open-source free collection, CC BY 4.0.
  Preserve attribution in Credits, and identify cursor artwork modifications.
- The surrounding interface should accommodate embedded pages with their own
  colors and aesthetics, including doodle-like designs.
- Use black and white for the first shell iteration, with no wallpaper. The wider
  visual direction remains open; pixel styling has not been selected.
- Do not apply the `frontend-design` skill or force the site into a named
  aesthetic category. The user explicitly rejected that approach.

## Wallpapers and Settings

- Set aside the Wallpaper Engine idea. Do not implement its formats, Workshop
  integration, or a compatible wallpaper runtime now.
- The desired future direction is real artwork from real artists, with a way
  for artists to pitch their work for use as wallpapers.
- Peaceful background movement is the desired experience; specific artwork,
  formats, and playback details remain open.
- Settings should allow visitors to change the wallpaper. A curated selection
  and saved preferences were discussed, but the exact selection/persistence UI
  is not finalized.
- Artist submissions, curation, credits, permissions, and delivery need a later
  design. Defer the submission workflow until that work is revisited.
- Stock footage, procedural background libraries, and AI-generated wallpapers
  have not been selected as substitutes for the artist-led direction.

## Deferred and unresolved

- Mobile/phone behavior is deferred; concentrate on the desktop experience.
- Exact shell geometry, typography, colors, wallpaper, and icon treatment.
- Which favorites/applications ship beyond the initial examples.
- Close/minimize controls, clicking an active taskbar entry, duplicate-launch
  behavior, and which view follows closing an application. Earlier suggested
  behaviors are proposals, not confirmed requirements.
- What returns after a reload: the launcher versus the last visible app, saved
  per-app locations, and how direct links interact with restored state.
- Journal presentation: entry-type names, filters, and taxonomy navigation.
- Clock timezone and formatting.
- Artist wallpaper submissions and Settings details.

## Icon research history

- [Streamline Plump](https://blog.streamlinehq.com/plump/): chunky, subtly curved
  silhouettes; investigate Solid and Remix. Remix combines linework and filled
  areas. Free subsets and premium libraries have different licensing terms.
- [Streamline Flex](https://blog.streamlinehq.com/flex/): curving, less rigid
  shapes with a Solid variant. Also offers free subsets and premium libraries.
- [Font Awesome Jelly Fill](https://fontawesome.com/icons/packs/jelly): a more
  expressive filled option. Requires Pro+; this is a smaller curated pack, so
  check the needed application symbols before selecting it.
- [IconPark](https://github.com/bytedance/IconPark): filled, two-tone, and
  multicolor themes; Apache-2.0. The repository is archived, so favor exported
  SVG assets rather than taking a runtime dependency on its framework packages.

Plump Remix Free is selected for the trial. The other families remain unselected
alternatives. Actual application symbols and cursor behavior can be tried at
`/studies/icons`; the broader shell's appearance is still open.

## First shell iteration

- The homepage now has an application launcher, a blank desktop, one fixed active
  window, right-hand favorites, and a bottom taskbar with the visitor's local clock.
- A small application registry supplies Journal, Blog, Weeknotes, Projects, and
  Settings. Projects and Settings are placeholders.
- Launcher search finds application names and titles from local Things,
  saved Links, and both abhi.now RSS feeds. External feeds currently expose their
  latest 24 Blog posts and 35 Weeknotes; the index covers the entries in those feeds.
- The journal window combines published Things and saved Links by date. Entries
  open inside the journal window while retaining their native permalinks. Search
  results open the selected article in its owning application.
- Blog and Weeknotes use separate browser-style iframe windows at native paths.
  Navigating between applications loads a new document and its frame.
- Open application IDs and their last visited local paths persist in localStorage.
  Reloads preserve the current URL and its application.
- Provisional skeleton behavior: launching an already open app focuses it; clicking
  its active taskbar button minimizes it to the desktop. Minimize and Close return
  to the desktop; Close also removes the taskbar entry. Start navigates between `/` and `/desktop`. These choices can be revisited after trying the shell.
- Shell edges and gaps use Tailwind `inset-4` / `gap-4` (16px); favorites align
  to the top. The launcher fills the same card area as application windows.
- The shell is monochrome with no wallpaper, retaining the existing Maple Mono
  typography, Plump Remix icons, and custom cursors. Existing content routes keep
  their presentation.

## Current next step

Try the updated shell geometry and full-text search before adding journal filters,
wallpaper controls, or a wider visual treatment.

## Current shell refinements

- Date sits above the time, formatted as `11 November, 2026`, with the clock's
  `uppercase` class handling display casing.
- Launcher/application windows and taskbar have 2px borders. Shell text is 15px;
  small interface labels are 14px to better balance the icon weight.
- A temporary theme toggle sits to the right of the clock. It switches the shell
  between monochrome light and dark palettes and persists the preference where
  localStorage is available. Embedded external sites retain their own themes.
- Continue running development servers with `pnpm dev --host` for LAN access.

## Native routing (confirmed architectural requirement)

- This is a multi-page Astro site. Use ordinary anchors and document navigation,
  with Astro ClientRouter enhancing navigation between real server-rendered paths.
  Do not replace application routes with hidden app windows.
- `/` is the launcher; `/desktop` is the blank desktop.
- Applications have real paths: `/journal`, `/blog`, `/weeknotes`, `/projects`,
  `/settings`, and `/colophon`.
- Journal entries and taxonomy archives retain their existing native paths and
  render within the shared computer layout, without a journal iframe.
- External search results have static local wrapper paths such as
  `/blog/why-i-write` and `/weeknotes/2026/44`, generated from the RSS entries.
- localStorage preserves open taskbar entries and each application's last local
  path across document loads. It does not replace native routing.
- Credits is the Colophon application at `/colophon`; `/credits` redirects there.
- This supersedes earlier proposals to keep app iframes mounted across switches.

## Latest taskbar and search decisions

- Remove the bottom-right Colophon link from the launcher; Colophon remains an
  application in the grid and taskbar.
- Post search is title-only, including local Journal entries and Blog, Weeknotes,
  and Snippets RSS titles. Result excerpts are removed.
- Projects embeds abhi.now rather than showing a placeholder. Its source site
  currently does not expose a Projects RSS feed; individual project search is
  not included in this iteration.
- Keep at most five open applications. New applications append at the end and
  evict the oldest when necessary; focusing an existing application does not
  reorder it. Persist and display that opening order. Prune evicted saved paths.
- Taskbar application links have 2px borders, filled hover states, and a matching
  filled active state for the current application's path (including subpaths).
- Theme toggle matches Start's dimensions, hover treatment, and selected fill.

## ClientRouter enhancement

- Keep Astro ClientRouter in the shared computer layout, with real route URLs,
  browser history, and direct links. Page transitions have no animations.
- Initialize shell controls on `astro:page-load`. Clean up clock intervals,
  document listeners, pending searches, and debounce timers before swapping.
- Carry the current theme into the incoming document before it is displayed.
- Use Astro's `navigate()` for programmatic navigation (close, Escape, search).

- Show the custom hourglass during ClientRouter navigation, beginning at
  `astro:before-preparation` and ending at `astro:page-load`. Preserve it across
  the document swap and clear it on loader failure, cancellation, or page restore.
