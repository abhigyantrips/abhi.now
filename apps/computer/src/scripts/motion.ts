// One interruptible animation per surface. Reversals start at the rendered pose.
const animations = new WeakMap<HTMLElement, Animation>();
export async function animateSurface(
	element: HTMLElement,
	keyframes: Keyframe[],
	duration: number | "enter" | "exit" = "enter",
	retain = false
) {
	const previous = animations.get(element);
	if (previous) {
		const style = getComputedStyle(element);
		keyframes = [{ opacity: style.opacity, transform: style.transform }, keyframes.at(-1)!];
		previous.cancel();
	}
	const style = getComputedStyle(element);
	const milliseconds =
		typeof duration === "number"
			? duration
			: parseFloat(
					style.getPropertyValue(duration === "enter" ? "--motion-surface" : "--motion-exit")
				) || (duration === "enter" ? 180 : 130);
	const animation = element.animate(keyframes, {
		duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : milliseconds,
		easing: style.getPropertyValue("--motion-ease").trim() || "ease-out",
		fill: "both",
	});
	animations.set(element, animation);
	try {
		await animation.finished;
	} catch {
		return false;
	}
	if (animations.get(element) !== animation) return false;
	if (!retain) {
		animations.delete(element);
		animation.cancel();
	}
	return true;
}

export function createPresence(element: HTMLElement, hiddenTransform: string) {
	let version = 0;
	let opened = false;
	let completion = Promise.resolve();
	return {
		get open() {
			return opened;
		},
		set(open: boolean) {
			if (opened === open) return completion;
			const current = ++version;
			opened = open;
			element.dataset.presence = open ? "opening" : "closing";
			element.inert = !open;
			if (open) element.hidden = false;
			const hidden = { opacity: 0, transform: hiddenTransform };
			const visible = { opacity: 1, transform: "none" };
			completion = (async () => {
				await animateSurface(
					element,
					open ? [hidden, visible] : [visible, hidden],
					open ? "enter" : "exit"
				);
				if (current !== version) return;
				element.dataset.presence = open ? "open" : "closed";
				if (!open) element.hidden = true;
			})();
			return completion;
		},
	};
}
