/**
 * All date logic goes through Temporal, pinned to India time.
 *
 * Frontmatter dates stay `Date` objects: Astro's content cache and
 * @astrojs/rss only understand `Date`, so convert here, at the point of use.
 */
const SITE_TIME_ZONE = 'Asia/Kolkata';

export function toInstant(date: Date): Temporal.Instant {
	return date.toTemporalInstant();
}

function toSiteDateTime(date: Date): Temporal.ZonedDateTime {
	return toInstant(date).toZonedDateTimeISO(SITE_TIME_ZONE);
}

const indianDateFormatter = new Intl.DateTimeFormat('en-IN', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: SITE_TIME_ZONE,
});

/**
 * Formats a date and time using Indian locale settings, e.g. "13 May 2026, 05:36 pm".
 *
 * Formats the Date itself, not a Temporal value: V8 ignores `hour: '2-digit'`
 * for Temporal types ("5:36 pm"), and search.js, which can't use Temporal,
 * would then disagree with the entry pages.
 */
export function formatDate(date: Date | undefined): string {
	if (!date) return '';
	return indianDateFormatter.format(date);
}

/**
 * Returns the year and zero-padded month of a date as seen in India.
 * Used for entry URLs and the archive, so they don't depend on the
 * build machine's time zone (Netlify builds in UTC).
 */
export function getYearMonth(date: Date): { year: number; month: string } {
	const { year, month } = toSiteDateTime(date);
	return { year, month: String(month).padStart(2, '0') };
}

/**
 * Full month name for an archive page, e.g. "October".
 * Uses PlainDate because PlainYearMonth.toLocaleString() throws
 * "Mismatched calendars" for the en-IN locale.
 */
export function formatMonthName(year: number, month: number): string {
	return Temporal.PlainDate.from({ year, month, day: 1 }).toLocaleString(
		'en-IN',
		{ month: 'long' },
	);
}

/**
 * Sort comparator, newest first. Temporal types throw on `valueOf()`,
 * so comparisons go through Temporal.Instant.compare.
 */
export function newestFirst(a: Date, b: Date): number {
	return Temporal.Instant.compare(toInstant(b), toInstant(a));
}

/**
 * Machine-readable timestamp for `<time datetime>` and search metadata,
 * e.g. "2026-09-25T06:02:00Z".
 */
export function toISO(date: Date): string {
	return toInstant(date).toString();
}
