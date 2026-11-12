export const preferencesChangedEvent = "abhi.computer:preferences-changed";

export function analyticsDisabled() {
	try {
		return localStorage.getItem("annu.disabled") === "true";
	} catch {
		return true;
	}
}

/** Use for same-tab writes; native storage events only notify other documents. */
export function setAnalyticsDisabled(disabled: boolean) {
	localStorage.setItem("annu.disabled", String(disabled));
	window.dispatchEvent(new Event(preferencesChangedEvent));
}
