// src/utils/date.js

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
export function formatDate(date) {
	if (!date) return '';
	return indianDateFormatter.format(date);
}
