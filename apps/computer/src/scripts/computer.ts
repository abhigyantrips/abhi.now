import {
	type TransitionBeforePreparationEvent,
	type TransitionBeforeSwapEvent,
} from "astro:transitions/client";
import { applications, type ApplicationId } from "../data/applications";
import { normalizeSearch, searchEntries, type SearchEntry } from "../lib/search";
import { initializeDesktopShell, validApplicationId as validId } from "./desktop-shell";

// Launcher DOM, search state and its downloaded index survive content navigation.
let indexPromise: Promise<SearchEntry[]> | undefined;

function initializeLauncherSearch() {
	if (!document.body.classList.contains("computer")) return;
	const controller = new AbortController();
	const cleanups: (() => void)[] = [];
	const search = document.querySelector<HTMLInputElement>("#app-search");
	function open(id: ApplicationId) {
		void shell?.activate(id);
	}
	if (search) {
		const resultSection = document.querySelector<HTMLElement>("#post-results")!;
		const resultList = document.querySelector<HTMLElement>("#search-results")!;
		const status = document.querySelector<HTMLElement>("#search-status")!;
		const retry = document.querySelector<HTMLButtonElement>("#search-retry")!;
		let queryVersion = 0;
		let searchTimer: ReturnType<typeof setTimeout>;
		cleanups.push(() => {
			clearTimeout(searchTimer);
			queryVersion++;
		});

		function loadIndex() {
			return (indexPromise ??= fetch("/search-index.json")
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
							: new URL(entry.url).pathname.replace(/\/?$/, "/") + new URL(entry.url).hash;
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
			if (event.key !== "Enter" || event.isComposing) return;
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

	return () => {
		controller.abort();
		cleanups.forEach((cleanup) => cleanup());
	};
}

let disposeSearch: (() => void) | undefined;
let shell: ReturnType<typeof initializeDesktopShell> | undefined;
let shellElement: Element | null = null;
function syncShell() {
	const element = document.querySelector(".taskbar");
	if (element !== shellElement) {
		disposeSearch?.();
		shell?.dispose();
		shell = element ? initializeDesktopShell() : undefined;
		disposeSearch = element ? initializeLauncherSearch() : undefined;
		shellElement = element;
	}
	shell?.sync();
}
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
	shell?.remember();
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
document.addEventListener("astro:after-swap", syncShell);
document.addEventListener("astro:page-load", () => {
	clearNavigationCursor();
	syncShell();
	shell?.pageLoaded();
});
window.addEventListener("pageshow", clearNavigationCursor);
