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
