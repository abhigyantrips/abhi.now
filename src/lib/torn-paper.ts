type TornPaperOptions = {
	width?: number;
	height?: number;
	segments?: number;
	depth?: number;
};

const DEFAULT_OPTIONS = {
	width: 360,
	height: 450,
	segments: 72,
	depth: 5.5,
} satisfies Required<TornPaperOptions>;

function hashSeed(seed: string) {
	let hash = 2166136261;

	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

function createRandom(seed: string) {
	let state = hashSeed(seed);

	return () => {
		state += 0x6d2b79f5;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function raggedOffset(random: () => number, depth: number, index: number) {
	const grain = Math.sin(index * 1.73 + random() * 0.8) * depth * 0.22;
	const fiber = (random() - 0.5) * depth * 0.35;
	const pull = random() * depth * 0.55;

	return Math.max(0.6, Math.min(depth * 1.2, depth * 0.38 + pull + grain + fiber));
}

function point(x: number, y: number) {
	return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

function createTornPaperPath(seed: string, options: Required<TornPaperOptions>) {
	const random = createRandom(seed);
	const { width, height, segments, depth } = options;
	const points: string[] = [];

	for (let i = 0; i <= segments; i++) {
		const x = (width / segments) * i;
		points.push(point(x, raggedOffset(random, depth, i)));
	}

	for (let i = 1; i <= segments; i++) {
		const y = (height / segments) * i;
		points.push(point(width - raggedOffset(random, depth, i), y));
	}

	for (let i = segments - 1; i >= 0; i--) {
		const x = (width / segments) * i;
		points.push(point(x, height - raggedOffset(random, depth, i)));
	}

	for (let i = segments - 1; i > 0; i--) {
		const y = (height / segments) * i;
		points.push(point(raggedOffset(random, depth, i), y));
	}

	return `M ${points.join(" L ")} Z`;
}

export function createTornPaperMask(seed: string, options: TornPaperOptions = {}) {
	const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
	const path = createTornPaperPath(seed, resolvedOptions);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${resolvedOptions.width} ${resolvedOptions.height}" preserveAspectRatio="none"><path fill="black" d="${path}"/></svg>`;

	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
