import { applications, type ApplicationId } from "../data/applications.ts";

export type AppSession = {
	status: "open" | "minimized";
	href: string;
	scrollByHref: Record<string, number>;
	checksByHref: Record<string, boolean[]>;
};
export type DesktopState = {
	activeApp: ApplicationId | null;
	launcherOpen: boolean;
	sessions: Partial<Record<ApplicationId, AppSession>>;
};

const storageKey = "abhi-computer-desktop-v1";
export const validApplicationId = (id: unknown): id is ApplicationId =>
	applications.some((app) => app.id === id);

// Only restore URLs within the application's own route tree.
export function belongsToApp(href: unknown, id: ApplicationId): href is string {
	if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return false;
	try {
		const url = new URL(href, "https://abhi.computer");
		const root = applications.find((app) => app.id === id)!.path;
		const roots = id === "journal" ? [root, "/things/", "/links/", "/tech/", "/fields/"] : [root];
		return (
			url.origin === "https://abhi.computer" && roots.some((path) => url.pathname.startsWith(path))
		);
	} catch {
		return false;
	}
}

export function createDesktopState(storage?: Pick<Storage, "getItem" | "setItem">) {
	const state: DesktopState = { activeApp: null, launcherOpen: false, sessions: {} };
	try {
		const saved = JSON.parse(storage?.getItem(storageKey) ?? "null");
		for (const app of applications) {
			const session = saved?.[app.id];
			if (!session || !belongsToApp(session.href, app.id)) continue;
			const scrollByHref: Record<string, number> = {};
			for (const [href, offset] of Object.entries(session.scrollByHref ?? {})) {
				if (belongsToApp(href, app.id) && typeof offset === "number" && Number.isFinite(offset))
					scrollByHref[href] = Math.max(0, offset);
			}
			const checksByHref: Record<string, boolean[]> = {};
			for (const [href, checks] of Object.entries(session.checksByHref ?? {})) {
				if (
					belongsToApp(href, app.id) &&
					Array.isArray(checks) &&
					checks.every((v) => typeof v === "boolean")
				)
					checksByHref[href] = checks;
			}
			state.sessions[app.id] = {
				status: session.status === "minimized" ? "minimized" : "open",
				href: session.href,
				scrollByHref,
				checksByHref,
			};
		}
	} catch {
		/* Private browsing and old/corrupt sessions must not prevent startup. */
	}
	function save() {
		try {
			storage?.setItem(storageKey, JSON.stringify(state.sessions));
		} catch {}
	}
	function visit(id: ApplicationId, href: string) {
		if (!belongsToApp(href, id)) return;
		const session = (state.sessions[id] ??= {
			status: "open",
			href,
			scrollByHref: {},
			checksByHref: {},
		});
		session.status = "open";
		session.href = href;
		state.activeApp = id;
		save();
	}
	return {
		state,
		save,
		visit,
		remember(id: ApplicationId, href: string, scroll: number, checks: boolean[]) {
			const session = state.sessions[id];
			if (!session || !belongsToApp(href, id)) return;
			session.href = href;
			session.scrollByHref[href] = scroll;
			session.checksByHref[href] = checks;
			save();
		},
		minimize(id: ApplicationId) {
			if (state.sessions[id]) state.sessions[id]!.status = "minimized";
			if (state.activeApp === id) state.activeApp = null;
			save();
		},
		close(id: ApplicationId) {
			delete state.sessions[id];
			if (state.activeApp === id) state.activeApp = null;
			save();
		},
	};
}
