import { navigate } from "astro:transitions/client";
import { applications, type ApplicationId } from "../data/applications";
import { initializeControlPanel } from "./control-panel";

export const validApplicationId = (id: unknown): id is ApplicationId =>
	applications.some((app) => app.id === id);

export function initializeDesktopShell() {
	const controller = new AbortController();
	initializeControlPanel(controller.signal);
	const storageKey = "abhi.computer.open-applications";
	const pathsKey = "abhi.computer.application-paths";
	const validId = validApplicationId;
	let opened: ApplicationId[] = [];
	let paths: Record<string, string> = {};
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
		if (Array.isArray(stored)) opened = [...new Set(stored.filter(validId))];
		const saved: unknown = JSON.parse(localStorage.getItem(pathsKey) ?? "{}");
		if (saved && typeof saved === "object" && !Array.isArray(saved)) {
			for (const [id, path] of Object.entries(saved)) {
				if (
					!validId(id) ||
					typeof path !== "string" ||
					!path.startsWith("/") ||
					path.startsWith("//")
				)
					continue;
				const pathname = new URL(path, location.origin).pathname;
				const owned =
					id === "journal"
						? /^\/(journal|things|links|tech|fields)(\/|$)/.test(pathname)
						: pathname === `/${id}` || pathname.startsWith(`/${id}/`);
				if (owned) {
					const url = new URL(path, location.origin);
					url.pathname = `${url.pathname.replace(/\/$/, "")}/`;
					paths[id] = url.pathname + url.search + url.hash;
				}
			}
		}
	} catch {
		/* Storage is optional. */
	}
	function save() {
		try {
			localStorage.setItem(storageKey, JSON.stringify(opened));
			localStorage.setItem(pathsKey, JSON.stringify(paths));
		} catch {}
	}

	function sync() {
		const active = document.body.dataset.app;
		if (validId(active)) {
			if (!opened.includes(active)) opened.push(active);
			paths[active] = location.pathname + location.search + location.hash;
		}
		opened = opened.slice(-5);
		for (const id of Object.keys(paths))
			if (!opened.includes(id as ApplicationId)) delete paths[id];
		save();
		for (const task of document.querySelectorAll<HTMLAnchorElement>("[data-taskbar]")) {
			const id = task.dataset.taskbar;
			if (!validId(id)) continue;
			task.hidden = !opened.includes(id);
			task.style.order = String(opened.indexOf(id));
			task.toggleAttribute("data-taskbar-divider", opened.indexOf(id) > 0);
			task.href = paths[id] ?? applications.find((app) => app.id === id)!.path;
			if (id === active) task.setAttribute("aria-current", "page");
			else task.removeAttribute("aria-current");
			task.removeAttribute("aria-pressed");
		}
		for (const favorite of document.querySelectorAll<HTMLElement>("[data-open-app]")) {
			if (favorite.dataset.openApp === active) favorite.setAttribute("aria-current", "page");
			else favorite.removeAttribute("aria-current");
		}
		const start = document.querySelector<HTMLAnchorElement>("#start")!;
		const launcherOpen = location.pathname === "/";
		start.href = launcherOpen ? "/desktop/" : "/";
		start.setAttribute("aria-expanded", String(launcherOpen));
	}

	function closeActiveApplication() {
		const active = document.body.dataset.app;
		opened = opened.filter((id) => id !== active);
		if (active) delete paths[active];
		save();
		void navigate("/desktop/");
	}
	function updateClock() {
		const now = new Date();
		const clock = document.querySelector<HTMLTimeElement>("#clock")!;
		clock.dateTime = now.toISOString();
		clock.querySelector("[data-clock-date]")!.textContent =
			`${now.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}, ${now.getFullYear()}`;
		clock.querySelector("[data-clock-time]")!.textContent = now.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
		clock.title = `${now.toLocaleDateString(undefined, { dateStyle: "full" })} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
	}

	updateClock();
	const clockInterval = setInterval(updateClock, 1000);

	return {
		sync,
		closeActiveApplication,
		dispose() {
			controller.abort();
			clearInterval(clockInterval);
		},
	};
}
