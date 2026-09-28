const indianDateFormatter = new Intl.DateTimeFormat('en-IN', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Asia/Kolkata',
});

/**
 * Formats a valid Date object using Indian locale settings.
 * Since Astro's Zod schema transforms your frontmatter dates into Date objects,
 * we can assume the input is a valid Date.
 */
export function formatDate(date: Date | undefined): string {
	if (!date) return '';
	return indianDateFormatter.format(date);
}

const indianYearMonthFormatter = new Intl.DateTimeFormat('en-IN', {
	year: 'numeric',
	month: '2-digit',
	timeZone: 'Asia/Kolkata',
});

/**
 * Returns the year and zero-padded month of a date as seen in India.
 * Use this instead of getFullYear()/getMonth(), which read the build
 * machine's time zone — Netlify builds in UTC, so URLs would shift.
 */
export function getYearMonth(date: Date): { year: number; month: string } {
	const parts = indianYearMonthFormatter.formatToParts(date);
	console.log(parts);
	const get = (type: string) => parts.find((part) => part.type === type)!.value;
	return { year: Number(get('year')), month: get('month') };
}
