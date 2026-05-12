import { type CollectionEntry, type render } from 'astro:content';

// Shared fields present in every content collection (notes, articles, links)
export interface BaseEntryData {
	pubDate: Date;
	draft?: boolean;
}

export interface InjectedProps {
	absoluteURL: string;
	relativeURL: string;
	Content: Awaited<ReturnType<typeof render>>['Content'];
}

// 2. Define a helper type for "Enhanced" entries
// This uses a Generic <T> to work with any specific collection
export type EnhancedEntry<T extends 'notes' | 'articles' | 'links'> =
	CollectionEntry<T> & InjectedProps;

// 3. Define the Union for your feed/list components
export type AnyEntry =
	| EnhancedEntry<'notes'>
	| EnhancedEntry<'articles'>
	| EnhancedEntry<'links'>;
