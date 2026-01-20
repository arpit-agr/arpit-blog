import { type CollectionEntry } from 'astro:content';

// 1. Define the manual additions
export interface InjectedProps {
	absoluteURL: string;
	relativeURL: string;
	Content: any;
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
