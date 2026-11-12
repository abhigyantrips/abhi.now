import {
	navigate,
	type TransitionBeforePreparationEvent,
	type TransitionBeforeSwapEvent,
} from "astro:transitions/client";
import { applications, type ApplicationId } from "../data/applications";
import { normalizeSearch, searchEntries, type SearchEntry } from "../lib/search";
import { initializeControlPanel } from "./control-panel";

function initializeComputer() {
	if (!document.body.classList.contains("computer")) return;
	const controller = new AbortController();
	initializeControlPanel(controller.signal);
	const cleanups: (() => void)[] = [];
	const storageKey = "abhi.computer.open-applications";
	const pathsKey = "abhi.computer.application-paths";
	const search = document.querySelector<HTMLInputElement>("#app-search");
	const active = document.body.dataset.app;
	const validId = (id: unknown): id is ApplicationId => applications.some((app) => app.id === id);
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
				if (owned) paths[id] = path;
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
	opened = opened.slice(-5);
	if (validId(active)) {
		if (!opened.includes(active)) opened.push(active);
		paths[active] = location.pathname + location.search + location.hash;
	}
	opened = opened.slice(-5);
	for (const id of Object.keys(paths)) if (!opened.includes(id as ApplicationId)) delete paths[id];
	save();
	for (const task of document.querySelectorAll<HTMLAnchorElement>("[data-taskbar]")) {
		const id = task.dataset.taskbar;
		if (!validId(id)) continue;
		task.hidden = !opened.includes(id);
		task.style.order = String(opened.indexOf(id));
		task.toggleAttribute("data-taskbar-divider", opened.indexOf(id) > 0);
		task.href = paths[id] ?? applications.find((app) => app.id === id)!.path;
		if (id === active) task.setAttribute("aria-current", "page");
		task.removeAttribute("aria-pressed");
	}
	document.querySelector("[data-close]")?.addEventListener("click", () => {
		opened = opened.filter((id) => id !== active);
		if (active) delete paths[active];
		save();
		void navigate("/desktop");
	});
	function open(id: ApplicationId) {
		void navigate(applications.find((app) => app.id === id)!.path);
	}
	if (search)
		document.addEventListener(
			"keydown",
			(event) => {
				if (
					event.key === "Escape" &&
					!document.querySelector("#control-panel")?.matches(":popover-open")
				)
					void navigate("/desktop");
			},
			{ signal: controller.signal }
		);
	if (search) {
		const resultSection = document.querySelector<HTMLElement>("#post-results")!;
		const resultList = document.querySelector<HTMLElement>("#search-results")!;
		const status = document.querySelector<HTMLElement>("#search-status")!;
		const retry = document.querySelector<HTMLButtonElement>("#search-retry")!;
		let indexPromise: Promise<SearchEntry[]> | undefined;
		let queryVersion = 0;
		let searchTimer: ReturnType<typeof setTimeout>;
		cleanups.push(() => {
			clearTimeout(searchTimer);
			queryVersion++;
		});

		function loadIndex() {
			return (indexPromise ??= fetch("/search-index.json", { signal: controller.signal })
				.then(async (response) => {
					if (!response.ok) throw new Error("Search index unavailable");
					const entries: unknown = await response.json();
					if (
						!Array.isArray(entries) ||
						!entries.every(
							(entry) =>
								entry &&
								validId(entry.app) &&
								[entry.title, entry.text, entry.url, entry.date].every(
									(value) => typeof value === "string"
								)
						)
					)
						throw new Error("Invalid search index");
					return entries as SearchEntry[];
				})
				.catch((error) => {
					indexPromise = undefined;
					throw error;
				}));
		}

		async function updateSearch(version: number) {
			const query = search!.value.trim();
			const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
			let appMatches = 0;
			document.querySelectorAll<HTMLAnchorElement>("[data-search]").forEach((button) => {
				button.hidden = !terms.every((term) =>
					normalizeSearch(button.dataset.search!).includes(term)
				);
				if (!button.hidden) appMatches++;
			});
			resultSection.hidden = !query;
			resultList.replaceChildren();
			retry.hidden = true;
			if (!query) {
				resultSection.removeAttribute("aria-busy");
				status.textContent = "";
				return;
			}
			resultSection.setAttribute("aria-busy", "true");
			status.textContent = "Searching posts…";
			try {
				const entries = await loadIndex();
				if (version !== queryVersion) return;
				const matches = searchEntries(entries, query);
				status.textContent = matches.length
					? `${matches.length} ${matches.length === 1 ? "post" : "posts"}${matches.length > 50 ? " · Showing the first 50" : ""}`
					: appMatches
						? "No matching posts."
						: "No results found.";
				for (const entry of matches.slice(0, 50)) {
					const anchor = document.createElement("a");
					anchor.className =
						"search-result flex flex-col gap-2 rounded-lg border-b border-neutral-200 p-4";
					anchor.href =
						entry.app === "journal"
							? entry.url
							: new URL(entry.url).pathname + new URL(entry.url).hash;
					anchor.dataset.contentApp = entry.app;
					anchor.dataset.contentTitle = entry.title;
					const meta = document.createElement("span");
					meta.className = "text-xs text-neutral-600";
					const app = applications.find((app) => app.id === entry.app)!;
					meta.textContent = `${app.title} · ${new Date(entry.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
					const title = document.createElement("span");
					title.className = "font-medium";
					title.textContent = entry.title;
					anchor.append(meta, title);
					resultList.append(anchor);
				}
			} catch {
				if (version !== queryVersion) return;
				status.textContent = "Couldn’t load post search. Try again.";
				retry.hidden = false;
			} finally {
				if (version === queryVersion) resultSection.removeAttribute("aria-busy");
			}
		}

		search.addEventListener("input", () => {
			clearTimeout(searchTimer);
			const version = ++queryVersion;
			searchTimer = setTimeout(() => updateSearch(version), 120);
		});
		retry.addEventListener("click", () => updateSearch(++queryVersion));
		search.addEventListener("keydown", async (event) => {
			if (event.key !== "Enter") return;
			event.preventDefault();
			const query = normalizeSearch(search.value.trim());
			const terms = query.split(/\s+/).filter(Boolean);
			const match = applications.find((app) =>
				terms.every((term) => normalizeSearch(app.title).includes(term))
			);
			if (match) open(match.id);
			else {
				clearTimeout(searchTimer);
				const version = ++queryVersion;
				await updateSearch(version);
				if (version === queryVersion) resultList.querySelector<HTMLAnchorElement>("a")?.click();
			}
		});
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
	cleanups.push(() => clearInterval(clockInterval));

	return () => {
		controller.abort();
		cleanups.forEach((cleanup) => cleanup());
	};
}

let dispose: (() => void) | undefined;
let navigationId = 0;
function clearNavigationCursor() {
	delete document.documentElement.dataset.navigationLoading;
}
document.addEventListener("astro:before-preparation", (event) => {
	if (!document.body.classList.contains("computer")) return;
	const preparation = event as TransitionBeforePreparationEvent;
	const id = ++navigationId;
	document.documentElement.dataset.navigationLoading = "true";
	const clear = () => {
		if (id === navigationId) clearNavigationCursor();
	};
	preparation.signal.addEventListener("abort", clear, { once: true });
	const load = preparation.loader;
	preparation.loader = async () => {
		try {
			await load();
		} catch (error) {
			clear();
			throw error;
		} finally {
			if (preparation.signal.aborted) clear();
		}
	};
});
document.addEventListener("astro:before-swap", (event) => {
	dispose?.();
	dispose = undefined;
	const incoming = (event as TransitionBeforeSwapEvent).newDocument;
	incoming.documentElement.dataset.theme = document.documentElement.dataset.theme ?? "light";
	incoming.documentElement.classList.toggle(
		"dark",
		incoming.documentElement.dataset.theme === "dark"
	);
	if (document.documentElement.dataset.navigationLoading) {
		incoming.documentElement.dataset.navigationLoading = "true";
	}
});
document.addEventListener("astro:page-load", () => {
	clearNavigationCursor();
	dispose?.();
	dispose = initializeComputer();
});
window.addEventListener("pageshow", clearNavigationCursor);
