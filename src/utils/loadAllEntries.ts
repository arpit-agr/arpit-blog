import { type CollectionEntry } from "astro:content";
import { loadAndFormatCollection } from "@utils/collection";

// Define a union of all the collection entry types you have
export type AnyEntry =
	| CollectionEntry<"notes">
	| CollectionEntry<"articles">
	| CollectionEntry<"links">;

export async function loadAllEntries(): Promise<AnyEntry[]> {
	// Load all collections in parallel
	const [notes, articles, links] = await Promise.all([
		loadAndFormatCollection("notes"),
		loadAndFormatCollection("articles"),
		loadAndFormatCollection("links"),
	]);

	// Merge them and assert that the combined array matches AnyEntry[]
	const allEntries = [...notes, ...articles, ...links] as AnyEntry[];

	// Sort in descending order by pubDate
	allEntries.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	return allEntries;
}
