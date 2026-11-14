# abhi.computer

Computer is part of the root pnpm workspace. Run `pnpm dev:computer` from the
repository root (port 4322), or `pnpm dev` from this application directory.
`pnpm build:computer` builds it independently; Now need not be running or deployed.

The desktop windows render Now's shared content directly. Collection sources live
under the root `content/`, including Computer's existing journal, links and
metadata in `content/computer/`. Search uses the same locally loaded, published
content as the reading windows. Article MDX retains its interactive components.
The native address bar's Open link points to the canonical Now URL.

Same-application links navigate locally; other public destinations open in a
separate tab. Theme, cursor and analytics preferences belong to this document,
with no cross-origin synchronization. `setAnalyticsDisabled()` remains the helper
for same-tab preference changes. External media inside authored articles is
independent of the retired Now iframe integration.

Computer's original journal uses its remark/rehype and code-meta renderer, while
shared Now content uses Now's Sätteri renderer. Shared prose styling and local
copies of presentation assets preserve article typography without importing Now's
full document layout or its global preference scripts.

Run `pnpm --filter abhi-computer check` from the repository root.
See the root [README](../../README.md) for Cloudflare
build settings, watch paths, and independent deployment commands.

Internal page links use trailing slashes to match Astro’s static directory output
and Cloudflare’s canonical URLs. This includes desktop shortcuts, shared-content
links and search results; asset URLs are unchanged.

The desktop shell lives in `src/components/desktop-shell.astro`. Named Astro
persistence boundaries retain the taskbar, launcher, tooltip and control panel.
`desktop-shell.ts` owns desktop commands and navigation lifecycle coordination;
`desktop-state.ts` owns per-application sessions. Switching apps resumes the last
URL (including calendar month), content scroll position and checkbox filters.
Minimize retains a session; close removes it. Sessions are saved in versioned
`sessionStorage` within this tab, with an in-memory fallback if storage is blocked.
Article content still renders through Astro and ClientRouter; inactive apps are
not kept mounted and arbitrary MDX widget state is not serialized.

The launcher is a persistent, nonmodal dialog over the workspace. Opening it makes
the workspace inert while keeping taskbar commands accessible. It focuses search,
supports arrow-key selection and Escape dismissal, restores focus on dismissal,
and retains its query across app navigation. The `/` route opens it on direct
entry; toggling it locally does not add browser history entries. Content navigation
and app switches use normal ClientRouter history; Back/Forward revisit those URLs.
Modified clicks retain ordinary link behavior.

`motion.ts` provides interruptible surface animations and presence lifecycles.
Launcher and tooltip exit animations finish before hiding their surfaces; new
requests supersede running animations. Tooltips use a 400ms pointer hover delay
and a short warm period when moving between icons; keyboard focus shows them
immediately. Windows animate on app entry, minimize, restore and close, while
same-app content navigation keeps its chrome steady. CSS motion tokens live in
`computer.css`; reduced-motion preferences remove spatial animation durations.
The search index is fetched once per document, and taskbar links prefetch their
destinations. Astro handles page HTML, head, style and script updates.

Run the state-model and motion tests with `node --test tests/*.test.ts` from this
application directory (Node 22.18+ supports the TypeScript test files directly).

The Weeknotes calendar also displays the `events` collection as Attended Events.
Add one JSON file per event in `content/computer/events/`, with `name`, `fromDate`,
`toDate`, and `link` fields. Copy `_example.json` to a descriptive filename such as
`conference-2026.json` and replace its values; filenames starting with `_` are
excluded from the collection. Dates use `YYYY-MM-DD`, both endpoints are included,
and a single-day event uses the same date for both. The end date must be on or after
the start date, and links must use HTTP or HTTPS. Event links open in a new tab.
The calendar includes all months covered by either collection; sidebar checkboxes
show or hide each calendar.
