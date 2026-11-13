export function initializeWeeknoteCalendar() {
	const calendar = document.querySelector<HTMLElement>("[data-weeknote-calendar]");
	if (!calendar || calendar.dataset.initialized) return;
	calendar.dataset.initialized = "true";
	const controller = new AbortController();
	const { signal } = controller;
	const panels = [...calendar.querySelectorAll<HTMLElement>("[data-calendar-panel]")];
	if (!panels.length) return;
	const links = [...calendar.querySelectorAll<HTMLAnchorElement>("[data-calendar-month]")];
	const heading = calendar.querySelector<HTMLElement>("[data-calendar-heading]")!;
	const previous = calendar.querySelector<HTMLButtonElement>('[data-calendar-step="-1"]')!;
	const next = calendar.querySelector<HTMLButtonElement>('[data-calendar-step="1"]')!;
	let index = panels.length - 1;

	function showMonth(nextIndex: number, updateHash = true) {
		index = Math.max(0, Math.min(panels.length - 1, nextIndex));
		panels.forEach((panel, position) => {
			panel.hidden = position !== index;
		});
		const selected = panels[index];
		const key = selected.dataset.calendarPanel!;
		const year = document.createElement("span");
		year.textContent = key.slice(0, 4);
		heading.replaceChildren(`${selected.dataset.monthName} `, year);
		links.forEach((link) => {
			if (link.dataset.calendarMonth === key) link.setAttribute("aria-current", "date");
			else link.removeAttribute("aria-current");
		});
		previous.disabled = index === 0;
		next.disabled = index === panels.length - 1;
		if (updateHash) history.replaceState(history.state, "", `#month=${key}`);
	}

	function restoreMonth() {
		const key = new URLSearchParams(location.hash.slice(1)).get("month");
		const requested = panels.findIndex((panel) => panel.dataset.calendarPanel === key);
		showMonth(requested < 0 ? panels.length - 1 : requested, false);
	}
	calendar.addEventListener(
		"click",
		(event) => {
			const monthLink = (event.target as Element).closest<HTMLAnchorElement>(
				"[data-calendar-month]"
			);
			if (monthLink) {
				if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
					return;
				event.preventDefault();
				showMonth(
					panels.findIndex(
						(panel) => panel.dataset.calendarPanel === monthLink.dataset.calendarMonth
					)
				);
				return;
			}
			const target = (event.target as Element).closest<HTMLElement>(
				"[data-calendar-step], [data-calendar-latest]"
			);
			if (!target) return;
			showMonth(
				target.hasAttribute("data-calendar-latest")
					? panels.length - 1
					: index + Number(target.dataset.calendarStep)
			);
		},
		{ signal }
	);
	window.addEventListener("hashchange", restoreMonth, { signal });
	document.addEventListener("astro:before-swap", () => controller.abort(), { once: true });
	restoreMonth();
	const today = new Date();
	const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	for (const time of calendar.querySelectorAll<HTMLTimeElement>(`time[datetime="${todayKey}"]`))
		time.setAttribute("aria-current", "date");
}
