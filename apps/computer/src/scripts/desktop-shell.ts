import { navigate } from "astro:transitions/client";
import { applications, type ApplicationId } from "../data/applications";
import { initializeControlPanel } from "./control-panel";

export const validApplicationId = (id: unknown): id is ApplicationId =>
	applications.some((app) => app.id === id);

export function initializeDesktopShell() {
	const controller = new AbortController();
	initializeControlPanel(controller.signal);
	let tooltipTarget: HTMLElement | undefined;
	function hideTooltip() {
		document.querySelector<HTMLElement>("#app-tooltip")!.hidden = true;
		tooltipTarget?.removeAttribute("aria-describedby");
		tooltipTarget = undefined;
	}
	function showTooltip(event: Event) {
		const target = (event.target as Element).closest<HTMLElement>("[data-app-title]");
		if (!target) return;
		if (target === tooltipTarget) return;
		hideTooltip();
		const tooltip = document.querySelector<HTMLElement>("#app-tooltip")!;
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
		tooltipTarget = target;
	}
	for (const type of ["pointerover", "focusin"]) {
		document.addEventListener(type, showTooltip, { signal: controller.signal });
	}
	for (const type of ["pointerout", "focusout"]) {
		document.addEventListener(
			type,
			(event) => {
				if (!tooltipTarget?.contains((event as FocusEvent).relatedTarget as Node | null))
					hideTooltip();
			},
			{ signal: controller.signal }
		);
	}
	document.addEventListener("scroll", hideTooltip, { capture: true, signal: controller.signal });
	document.addEventListener(
		"keydown",
		(event) => {
			if (event.key === "Escape") hideTooltip();
		},
		{ signal: controller.signal }
	);

	function sync() {
		hideTooltip();
		const active = document.body.dataset.app;
		for (const task of document.querySelectorAll<HTMLAnchorElement>("[data-taskbar]")) {
			if (task.dataset.taskbar === active) task.setAttribute("aria-current", "page");
			else task.removeAttribute("aria-current");
		}
		const start = document.querySelector<HTMLAnchorElement>("#start")!;
		const launcherOpen = location.pathname === "/";
		start.href = launcherOpen ? "/desktop/" : "/";
		start.setAttribute("aria-expanded", String(launcherOpen));
	}

	function closeActiveApplication() {
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
