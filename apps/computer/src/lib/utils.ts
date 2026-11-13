const WORDS_PER_MINUTE = 200;

export function formatReadingTime(text: string): string {
	const words = text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]+`/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#*_~[\]()!>|]/g, " ")
		.split(/\s+/)
		.filter(Boolean).length;

	const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
	return `${minutes} min read`;
}
