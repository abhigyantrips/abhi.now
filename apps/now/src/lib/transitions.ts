import type { TransitionAnimationValue } from "astro";

export const slideFromBottom: TransitionAnimationValue = {
	forwards: {
		old: {
			name: "fadeScaleDown",
			duration: "0.3s",
			easing: "ease-in-out",
			fillMode: "forwards",
		},
		new: {
			name: "slideInFromBottom",
			duration: "0.3s",
			easing: "ease-in-out",
			fillMode: "forwards",
		},
	},
	backwards: {
		old: {
			name: "fadeScaleDown",
			duration: "0.3s",
			easing: "ease-in-out",
			fillMode: "forwards",
		},
		new: {
			name: "slideInFromTop",
			duration: "0.3s",
			easing: "ease-in-out",
			fillMode: "forwards",
		},
	},
};
