import { loadAndFormatCollection } from '@utils/collection';
import type { AnyEntry } from '@appTypes/entries';

/**
 * Loads notes, articles, and links, formats them with URLs
 * and Content components, and returns a combined, sorted array.
 */
export async function loadAllEntries(): Promise<AnyEntry[]> {
	// 1. Load all collections in parallel.
	// The utility's generics handle the type mapping automatically.
	const [notes, articles, links] = await Promise.all([
		loadAndFormatCollection('notes'),
		loadAndFormatCollection('articles'),
		loadAndFormatCollection('links'),
	]);

	// 2. Merge them into a single array
	const allEntries: AnyEntry[] = [...notes, ...articles, ...links];

	// 3. Sort by pubDate descending
	// (Though the utility now sorts individually, we must sort the combined list)
	return allEntries.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}
