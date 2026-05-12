import { getCollection, render } from 'astro:content';
import type { EnhancedEntry, BaseEntryData } from '@appTypes/entries';

export async function loadAndFormatCollection<
	T extends 'notes' | 'articles' | 'links',
>(name: T, withDate = true): Promise<EnhancedEntry<T>[]> {
	const allEntries = await getCollection(name);

	const pubEntries = allEntries.filter((entry) =>
		import.meta.env.PROD ? (entry.data as BaseEntryData).draft !== true : true,
	);

	const formatted = await Promise.all(
		pubEntries.map(async (entry) => {
			const { Content } = await render(entry);

			// T is generic here so TypeScript can't resolve CollectionEntry<T>['data']
			// to a concrete shape — cast to the shared base all three collections extend.
			const pubDate = (entry.data as BaseEntryData).pubDate;
			const year = pubDate.getFullYear();
			const month = (pubDate.getMonth() + 1).toString().padStart(2, '0');

			const relativeURL = withDate
				? `${year}/${month}/${entry.id}/`
				: `${entry.id}/`;

			return {
				...entry,
				Content,
				relativeURL,
				absoluteURL: `/${name}/${relativeURL}`,
			} as EnhancedEntry<T>;
		}),
	);

	return formatted.sort(
		(a, b) =>
			(b.data as BaseEntryData).pubDate.valueOf() -
			(a.data as BaseEntryData).pubDate.valueOf(),
	);
}
