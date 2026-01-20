import { getCollection, render } from 'astro:content';
import type { EnhancedEntry } from '@appTypes/entries';

export async function loadAndFormatCollection<
	T extends 'notes' | 'articles' | 'links',
>(name: T, withDate = true): Promise<EnhancedEntry<T>[]> {
	const allEntries = await getCollection(name);

	// Filter out drafts in production
	const pubEntries = allEntries.filter((entry) =>
		import.meta.env.PROD ? (entry.data as any).draft !== true : true,
	);

	const formatted = await Promise.all(
		pubEntries.map(async (entry) => {
			// 1. Get the Content component from Astro's render function
			const { Content } = await render(entry);

			// 2. Extract and format the date logic
			// Note: We cast entry.data as any here because TypeScript's generic
			// inference for union schemas can occasionally be overly cautious.
			const date = new Date((entry.data as any).pubDate);
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');

			const relativeURL = withDate
				? `${year}/${month}/${entry.id}/`
				: `${entry.id}/`;

			// 3. Construct the final enhanced entry
			return {
				...entry,
				Content,
				relativeURL,
				absoluteURL: `/${name}/${relativeURL}`,
			} as EnhancedEntry<T>;
		}),
	);

	// 4. Return the list, sorted by date (standard for feed/blog logic)
	return formatted.sort(
		(a, b) =>
			new Date((b.data as any).pubDate).valueOf() -
			new Date((a.data as any).pubDate).valueOf(),
	);
}
