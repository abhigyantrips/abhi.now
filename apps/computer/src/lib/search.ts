import type { ApplicationId } from "../data/applications";

export interface SearchEntry {
	app: ApplicationId;
	title: string;
	url: string;
	date: string;
	text: string;
}

export function normalizeSearch(value: string) {
	return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

export function searchEntries(entries: SearchEntry[], query: string) {
	const normalized = normalizeSearch(query.trim());
	const terms = normalized.split(/\s+/).filter(Boolean);
	if (!terms.length) return [];
	return entries
		.map((entry) => {
			const title = normalizeSearch(entry.title);
			if (!terms.every((term) => title.includes(term))) return null;
			const score =
				(title === normalized ? 100 : title.includes(normalized) ? 50 : 0) +
				terms.filter((term) => title.includes(term)).length * 10;
			return { entry, score };
		})
		.filter((match) => match !== null)
		.sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date))
		.map(({ entry }) => entry);
}
