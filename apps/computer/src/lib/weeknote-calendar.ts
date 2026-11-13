const DAY = 86_400_000;

/** Calendar dates stay in UTC so the build and reader's time zones cannot shift a day. */
export function dateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function monthKey(date: Date): string {
	return dateKey(date).slice(0, 7);
}

export function calendarMonths(first: Date, last: Date): string[] {
	const months: string[] = [];
	const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
	const end = monthKey(last);
	while (monthKey(cursor) <= end) {
		months.push(monthKey(cursor));
		cursor.setUTCMonth(cursor.getUTCMonth() + 1);
	}
	return months;
}

export function monthDate(month: string): Date {
	return new Date(`${month}-01T00:00:00Z`);
}

export function monthWeeks(month: string): Date[][] {
	const first = monthDate(month);
	const start = first.getTime() - first.getUTCDay() * DAY;
	const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
	const count = Math.ceil((first.getUTCDay() + last.getUTCDate()) / 7);
	return Array.from({ length: count }, (_, row) =>
		Array.from({ length: 7 }, (_, column) => new Date(start + (row * 7 + column) * DAY))
	);
}

/** Inclusive event placement, clipped to a single calendar row. */
export function weekSegment(week: Date[], from: Date, to: Date) {
	const start = Math.max(week[0].getTime(), new Date(`${dateKey(from)}T00:00:00Z`).getTime());
	const end = Math.min(week[6].getTime(), new Date(`${dateKey(to)}T00:00:00Z`).getTime());
	if (start > end) return null;
	const column = Math.round((start - week[0].getTime()) / DAY) + 1;
	return { column, span: Math.round((end - start) / DAY) + 1 };
}
