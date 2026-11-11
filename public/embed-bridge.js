(() => {
	const root = document.documentElement;
	if (root.dataset.embed !== "computer") return;
	const scope = root.dataset.embedScope;
	const allowed = [
		"https://abhi.computer",
		...(document.currentScript?.dataset.development === "true" ? ["http://localhost:4321"] : []),
	];
	let parentOrigin;
	try {
		const referrer = new URL(document.referrer).origin;
		if (allowed.includes(referrer)) parentOrigin = referrer;
	} catch {}
	let configured = false;
	let lastReportedHref;
	let started = false;
	let blocked = true;
	let ownDisabled = () => {
		try {
			return localStorage.getItem("annu.disabled") === "true";
		} catch {
			return true;
		}
	};
	const theme = (value) => {
		root.dataset.theme = value;
		root.classList.toggle("dark", value === "dark");
		root.style.colorScheme = value;
	};
	theme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
	const send = (type, fields = {}) => {
		if (window.parent !== window && parentOrigin)
			window.parent.postMessage({ type, version: 1, ...fields }, parentOrigin);
	};
	const ready = () => send("abhi.now:ready");
	const reportLocation = (force = false) => {
		if (!configured || window.parent === window) return;
		const href = window.location.href;
		if (!force && href === lastReportedHref) return;
		send("abhi.now:location", { href });
		lastReportedHref = href;
	};
	// Document navigation creates a fresh bridge. These events cover same-document
	// fragment navigation and history traversal, without scanning links or polling.
	window.addEventListener("hashchange", () => reportLocation());
	window.addEventListener("popstate", () => reportLocation());
	// Annu 0.1 has no teardown API. Suppress unload analytics during a blocked
	// transition; reload destroys its timers/listeners and the new document waits.
	for (const event of ["pagehide", "visibilitychange"]) {
		window.addEventListener(
			event,
			(e) => {
				if (blocked) e.stopImmediatePropagation();
			},
			true
		);
	}
	const reset = () => {
		blocked = true;
		window.location.reload();
	};
	window.addEventListener("message", (event) => {
		if (
			window.parent === window ||
			event.source !== window.parent ||
			!allowed.includes(event.origin)
		)
			return;
		const data = event.data;
		if (
			!data ||
			data.type !== "abhi.computer:configure" ||
			data.version !== 1 ||
			data.scope !== scope ||
			(data.theme !== "dark" && data.theme !== "light") ||
			typeof data.annuDisabled !== "boolean" ||
			typeof data.cursors !== "string"
		)
			return;
		const style = document.getElementById("computer-cursors");
		if (!style) return;
		const firstConfiguration = !configured || parentOrigin !== event.origin;
		parentOrigin = event.origin;
		configured = true;
		if (style.textContent !== data.cursors) style.textContent = data.cursors;
		theme(data.theme);
		blocked = data.annuDisabled || ownDisabled();
		send("abhi.now:configured");
		reportLocation(firstConfiguration);
		if (blocked && started) {
			reset();
			return;
		}
		if (!blocked && !started) {
			started = true;
			const script = document.createElement("script");
			script.src = "https://annu.abhi.now/script.js";
			script.async = true;
			Object.assign(script.dataset, {
				siteId: "3a90c2c4-8cff-4861-8f64-23f04862ac13",
				domains: "abhi.now",
				heartbeat: "true",
				performance: "true",
				links: "true",
			});
			document.head.appendChild(script);
		}
	});
	window.addEventListener("storage", (event) => {
		if ((event.key === "annu.disabled" || event.key === null) && ownDisabled()) {
			blocked = true;
			if (started) reset();
		}
	});
	// Register after the capture guard above; a persisted restore must request
	// fresh settings before the restored analytics client can run again.
	window.addEventListener(
		"pageshow",
		(event) => {
			if (!event.persisted) return;
			blocked = true;
			reportLocation(true);
			ready();
			event.stopImmediatePropagation();
			if (started) reset();
		},
		true
	);
	ready();
})();
