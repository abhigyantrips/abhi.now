import { navigate } from "astro:transitions/client";
import { applications, type ApplicationId } from "../data/applications";
import { initializeControlPanel } from "./control-panel";
import { createDesktopState, validApplicationId } from "./desktop-state";
import { animateSurface, createPresence } from "./motion";
export { validApplicationId } from "./desktop-state";

export function initializeDesktopShell() {
	const controller = new AbortController();
	const { signal } = controller;
	initializeControlPanel(signal);
	let storage: Storage | undefined;
	try {
		storage = sessionStorage;
	} catch {}
	const desktop = createDesktopState(storage);
	const { state } = desktop;
	const launcher = document.querySelector<HTMLDialogElement>("#launcher")!;
	const start = document.querySelector<HTMLAnchorElement>("#start")!;
	const launcherPresence = createPresence(launcher, "translateY(12px) scale(.985)");
	const tooltip = document.querySelector<HTMLElement>("#app-tooltip")!;
	const tooltipPresence = createPresence(tooltip, "translateY(4px)");
	let tooltipTarget: HTMLElement | undefined;
	let tooltipTimer: ReturnType<typeof setTimeout>;
	let warmUntil = 0;
	let returnFocus: HTMLElement | null = null;
	let actionVersion = 0;
	let lastApp: string | undefined;
	const href = () => location.pathname + location.search + location.hash;
	const content = () => document.querySelector<HTMLElement>("[data-application-content]");

	function remember() {
		const id = document.body.dataset.app;
		const pane = content();
		if (validApplicationId(id) && pane)
			desktop.remember(
				id,
				href(),
				pane.scrollTop,
				[...pane.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].map(
					(input) => input.checked
				)
			);
	}
	function hideTooltip() {
		clearTimeout(tooltipTimer);
		if (tooltipPresence.open) warmUntil = performance.now() + 700;
		tooltipTarget?.removeAttribute("aria-describedby");
		tooltipTarget = undefined;
		void tooltipPresence.set(false);
	}
	function showTooltip(event: Event) {
		const target = (event.target as Element).closest<HTMLElement>("[data-app-title]");
		if (!target || target === tooltipTarget) return;
		hideTooltip();
		tooltipTarget = target;
		tooltipTimer = setTimeout(
			() => {
				if (!target.isConnected || tooltipTarget !== target) return;
				tooltip.querySelector("[data-tooltip-title]")!.textContent = target.dataset.appTitle!;
				tooltip.querySelector("[data-tooltip-description]")!.textContent =
					target.dataset.appDescription!;
				tooltip.hidden = false;
				const bounds = target.getBoundingClientRect();
				const left = target.hasAttribute("data-taskbar")
					? bounds.left - tooltip.offsetWidth - 8
					: bounds.left + (bounds.width - tooltip.offsetWidth) / 2;
				tooltip.style.left = `${Math.max(16, Math.min(left, innerWidth - tooltip.offsetWidth - 16))}px`;
				tooltip.style.top = `${Math.max(16, Math.min(bounds.top, innerHeight - tooltip.offsetHeight - 16))}px`;
				target.setAttribute("aria-describedby", "app-tooltip");
				void tooltipPresence.set(true);
			},
			event.type === "focusin" || performance.now() < warmUntil ? 0 : 400
		);
	}
	for (const type of ["pointerover", "focusin"])
		document.addEventListener(type, showTooltip, { signal });
	for (const type of ["pointerout", "focusout"])
		document.addEventListener(
			type,
			(event) => {
				if (!tooltipTarget?.contains((event as FocusEvent).relatedTarget as Node | null))
					hideTooltip();
			},
			{ signal }
		);
	document.addEventListener("scroll", hideTooltip, { capture: true, signal });
	window.addEventListener("resize", hideTooltip, { signal });

	async function setLauncher(open: boolean, restoreFocus = true) {
		if (state.launcherOpen === open) return;
		state.launcherOpen = open;
		document.querySelector<HTMLElement>(".workspace")!.inert = open;
		start.setAttribute("aria-expanded", String(open));
		hideTooltip();
		if (open) {
			if (!launcher.open) {
				returnFocus =
					document.activeElement instanceof HTMLElement ? document.activeElement : start;
				launcher.hidden = false;
				launcher.show();
			}
			void launcherPresence.set(true);
			launcher.querySelector<HTMLInputElement>("#app-search")!.focus({ preventScroll: true });
		} else {
			await launcherPresence.set(false);
			if (state.launcherOpen) return;
			launcher.close();
			if (restoreFocus)
				(returnFocus?.isConnected ? returnFocus : start).focus({ preventScroll: true });
		}
	}
	launcher.addEventListener(
		"cancel",
		(event) => {
			event.preventDefault();
			void setLauncher(false);
		},
		{ signal }
	);
	launcher.addEventListener(
		"click",
		(event) => {
			if (event.target !== launcher) return;
			const rect = launcher.getBoundingClientRect();
			if (
				event.clientX < rect.left ||
				event.clientX > rect.right ||
				event.clientY < rect.top ||
				event.clientY > rect.bottom
			)
				void setLauncher(false);
		},
		{ signal }
	);
	launcher.addEventListener(
		"keydown",
		(event) => {
			if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
			const search = launcher.querySelector("#app-search");
			if (event.target === search && !["ArrowDown", "ArrowUp"].includes(event.key)) return;
			const links = [...launcher.querySelectorAll<HTMLAnchorElement>("a")].filter(
				(link) => link.getClientRects().length
			);
			if (!links.length) return;
			event.preventDefault();
			const index = links.indexOf(document.activeElement as HTMLAnchorElement);
			const step = ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1;
			links[(index + step + links.length) % links.length].focus();
		},
		{ signal }
	);
	document.addEventListener(
		"keydown",
		(event) => {
			if (event.key === "Escape") hideTooltip();
			if (
				event.key === "Escape" &&
				state.launcherOpen &&
				!document.querySelector("#control-panel")?.matches(":popover-open")
			) {
				event.preventDefault();
				void setLauncher(false);
			}
		},
		{ signal }
	);

	async function go(destination: string) {
		try {
			await navigate(destination);
		} catch {
			const surface = document.querySelector<HTMLElement>(".application-window");
			if (surface)
				void animateSurface(surface, [{ opacity: 0 }, { opacity: 1, transform: "none" }]);
			pageLoaded();
			document.querySelector("#desktop-status")!.textContent =
				"Couldn’t open that page. Please try again.";
		}
	}
	async function activate(id: ApplicationId) {
		++actionVersion;
		remember();
		const destination = state.sessions[id]?.href ?? applications.find((app) => app.id === id)!.path;
		void setLauncher(false, false);
		hideTooltip();
		// Already active: avoid a fetch and preserve the live DOM.
		if (state.activeApp === id && destination === href()) {
			const surface = document.querySelector<HTMLElement>(".application-window");
			if (surface) void animateSurface(surface, [{ opacity: 1, transform: "none" }]);
			document.querySelector<HTMLElement>(".window-header h2")?.focus({ preventScroll: true });
			return;
		}
		await go(destination);
	}
	function taskTransform(element: HTMLElement, id: ApplicationId) {
		const task = document.querySelector<HTMLElement>(`[data-taskbar="${id}"]`);
		if (!task) return "translateY(8px) scale(.97)";
		const from = element.getBoundingClientRect(),
			to = task.getBoundingClientRect();
		return `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px) scale(.08)`;
	}
	async function dismiss(kind: "close" | "minimize") {
		const id = document.body.dataset.app;
		if (!validApplicationId(id)) return;
		const version = ++actionVersion;
		remember();
		const windowElement = document.querySelector<HTMLElement>(".application-window")!;
		const task = document.querySelector<HTMLElement>(`[data-taskbar="${id}"]`);
		const transform =
			kind === "minimize" ? taskTransform(windowElement, id) : "translateY(8px) scale(.97)";
		await animateSurface(
			windowElement,
			[
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform },
			],
			150,
			true
		);
		if (version !== actionVersion) return;
		desktop[kind](id);
		await go("/desktop/");
		if (location.pathname === "/desktop/" && !state.activeApp)
			(task ?? start).focus({ preventScroll: true });
	}
	// Capture before ClientRouter sees shell commands. Modified clicks remain ordinary links.
	document.addEventListener(
		"click",
		(event) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			)
				return;
			const target = (event.target as Element).closest<HTMLElement>(
				"#start, [data-taskbar], [data-launch], [data-minimize], [data-close]"
			);
			if (!target) {
				if (state.launcherOpen && !launcher.contains(event.target as Node)) void setLauncher(false);
				return;
			}
			event.preventDefault();
			if (target.id === "start") void setLauncher(!state.launcherOpen);
			else if (target.hasAttribute("data-close")) void dismiss("close");
			else if (target.hasAttribute("data-minimize")) void dismiss("minimize");
			else {
				const id = target.dataset.taskbar ?? target.dataset.launch;
				if (validApplicationId(id)) void activate(id);
			}
		},
		{ capture: true, signal }
	);

	function sync() {
		hideTooltip();
		const active = document.body.dataset.app;
		for (const task of document.querySelectorAll<HTMLAnchorElement>("[data-taskbar]")) {
			const id = task.dataset.taskbar;
			if (id === active) task.setAttribute("aria-current", "page");
			else task.removeAttribute("aria-current");
			if (validApplicationId(id)) {
				const session = state.sessions[id];
				task.dataset.session = session?.status ?? "closed";
				task.href = session?.href ?? applications.find((app) => app.id === id)!.path;
			}
		}
		start.href = "/";
		start.setAttribute("aria-expanded", String(state.launcherOpen));
	}
	function pageLoaded() {
		document.querySelector("#desktop-status")!.textContent = "";
		const id = document.body.dataset.app;
		if (validApplicationId(id)) {
			const restoring = state.sessions[id]?.status === "minimized";
			desktop.visit(id, href());
			const session = state.sessions[id]!;
			const pane = content();
			pane?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input, index) => {
				const checked = session.checksByHref[href()]?.[index];
				if (checked !== undefined) {
					input.checked = checked;
					input.dispatchEvent(new Event("change", { bubbles: true }));
				}
			});
			if (pane && session.scrollByHref[href()] !== undefined)
				pane.scrollTop = session.scrollByHref[href()];
			const windowElement = document.querySelector<HTMLElement>(".application-window")!;
			if (lastApp !== id)
				void animateSurface(windowElement, [
					{
						opacity: 0,
						transform: restoring ? taskTransform(windowElement, id) : "translateY(8px) scale(.985)",
					},
					{ opacity: 1, transform: "none" },
				]);
		} else state.activeApp = null;
		lastApp = id;
		if (location.pathname === "/") void setLauncher(true);
		sync();
	}
	document.addEventListener(
		"astro:before-preparation",
		() => {
			++actionVersion;
			remember();
			void setLauncher(false, false);
		},
		{ signal }
	);
	window.addEventListener("pagehide", remember, { signal });
	window.addEventListener(
		"hashchange",
		() => {
			remember();
			sync();
		},
		{ signal }
	);
	// The server renders the launcher on / for direct-entry and no-JS visitors.
	const initialLauncher = location.pathname === "/";
	launcher.removeAttribute("open");
	launcher.hidden = true;
	if (initialLauncher) void setLauncher(true);
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
		pageLoaded,
		remember,
		activate,
		dispose() {
			controller.abort();
			clearInterval(clockInterval);
			clearTimeout(tooltipTimer);
		},
	};
}
