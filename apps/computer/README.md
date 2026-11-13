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
links, search results, and remembered application paths; asset URLs are unchanged.

The desktop shell lives in `src/components/desktop-shell.astro`. Named Astro
persistence boundaries retain favorites, the taskbar (including the clock), and
the control panel across navigation. `src/scripts/desktop-shell.ts` initializes
those controls once, then synchronizes active links and remembered app paths after
each swap. Workspace listeners and search UI use a separate disposable page
lifecycle in `computer.ts`. The search index is fetched once per document, and
visible desktop app links prefetch their destinations. Astro still fetches page
HTML and handles head/style/script updates during navigation.

The Weeknotes calendar also displays the `events` collection as Attended Events.
Add one JSON file per event in `content/computer/events/`, with `name`, `fromDate`,
`toDate`, and `link` fields. Copy `_example.json` to a descriptive filename such as
`conference-2026.json` and replace its values; filenames starting with `_` are
excluded from the collection. Dates use `YYYY-MM-DD`, both endpoints are included,
and a single-day event uses the same date for both. The end date must be on or after
the start date, and links must use HTTP or HTTPS. Event links open in a new tab.
The calendar includes all months covered by either collection; sidebar checkboxes
show or hide each calendar.
