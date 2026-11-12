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

Run `pnpm --filter abhi-computer check` and `pnpm --filter abhi-computer test`
from the repository root. See the root [README](../../README.md) for Cloudflare
build settings, watch paths, and independent deployment commands.
