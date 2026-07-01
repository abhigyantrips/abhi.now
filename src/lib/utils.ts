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

export function isEpochTimestamp(str: string): boolean {
	// Check if the string is a number
	if (!/^\d+$/.test(str)) return false;

	const num = Number(str);

	// Typical epoch timestamp ranges (seconds or milliseconds)
	// Seconds: 10 digits (1970-2286), Milliseconds: 13 digits (1970-33658)
	return (
		(str.length === 10 && num >= 0 && num <= 9999999999) ||
		(str.length === 13 && num >= 0 && num <= 9999999999999)
	);
}

export function getWeekNumber(date: Date) {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
