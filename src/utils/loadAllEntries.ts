import { loadAndFormatCollection } from '@utils/collection';
import type { AnyEntry } from '@appTypes/entries';

export async function loadAllEntries(): Promise<AnyEntry[]> {
	const [notes, articles, links] = await Promise.all([
		loadAndFormatCollection('notes'),
		loadAndFormatCollection('articles'),
		loadAndFormatCollection('links'),
	]);

	const allEntries: AnyEntry[] = [...notes, ...articles, ...links];

	// Each collection is pre-sorted, but the merged list needs its own sort.
	return allEntries.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}
