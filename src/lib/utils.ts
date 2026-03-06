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
