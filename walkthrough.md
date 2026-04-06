# arpit.blog — A Complete Code Walkthrough

*2026-04-06T08:29:49Z by Showboat 0.6.1*
<!-- showboat-id: 18d70674-d565-4ff1-9578-e57f9a53128c -->

This is a complete walkthrough of the **arpit.blog** codebase — a personal blog built with [Astro](https://astro.build/). The site publishes three kinds of content (notes, articles, and links), maintains a book library, and generates RSS feeds and a full-text search index. Everything is statically generated at build time.

We will trace the code from configuration through content loading, rendering, and finally the browser. Each section includes the actual source so you can read and verify every claim.

## Tech Stack at a Glance

Let's start by seeing what powers this site.

```bash
grep -E '"(astro|@astrojs|astro-|sharp|markdown-it|postcss-utopia|github-slugger)' package.json
```

```output
		"dev": "astro dev",
		"build": "astro check && astro build",
		"preview": "astro preview",
		"astro": "astro",
		"@astrojs/check": "^0.9.8",
		"@astrojs/mdx": "^5.0.3",
		"@astrojs/rss": "^4.0.18",
		"astro": "^6.1.3",
		"astro-font": "^1.1.0",
		"astro-html-minifier-next": "^2.1.0",
		"astro-pagefind": "^1.8.6",
		"markdown-it": "^14.1.0",
		"postcss-utopia": "^1.1.0",
		"sharp": "^0.34.5",
```

The core framework is **Astro 6.1.3**, a static site generator that renders components to HTML at build time with zero JavaScript by default. Key integrations:

- **@astrojs/mdx** — write content in Markdown/MDX
- **@astrojs/rss** — generate RSS feeds
- **astro-pagefind** — full-text search indexing (runs post-build)
- **astro-html-minifier-next** — minifies generated HTML
- **astro-font** — web font loading
- **sharp** — image optimization and format conversion
- **markdown-it** — Markdown parsing for RSS feed content
- **postcss-utopia** — fluid typography via PostCSS

## 1. Configuration

### astro.config.mjs — the build entry point

This file tells Astro how to build the site. It sets the production URL, enables integrations, and configures Markdown rendering.

```bash
cat astro.config.mjs
```

```output
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import htmlMinifierNext from 'astro-html-minifier-next';

// https://astro.build/config
export default defineConfig({
	site: 'https://arpit.blog',
	markdown: {
		shikiConfig: {
			theme: 'css-variables',
			defaultColor: false,
		},
	},
	integrations: [
		mdx(),
		pagefind(),
		htmlMinifierNext({
			caseSensitive: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			continueOnMinifyError: false,
			keepClosingSlash: false,
			preventAttributesEscaping: true,
			removeComments: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
		}),
	],
	vite: {
		build: {
			rollupOptions: {
				// This tells Rollup: "Don't try to find this file, it's external"
				external: ['/pagefind/pagefind.js'],
			},
		},
	},
	trailingSlash: 'always',
});
```

Key decisions encoded here:

- **`site: "https://arpit.blog"`** — used to generate absolute URLs in RSS feeds and meta tags.
- **`trailingSlash: "always"`** — every URL ends with `/`, so `/articles/` not `/articles`. This affects how Astro generates static files (each page becomes `index.html` inside a directory).
- **Shiki with `css-variables` theme** — syntax highlighting uses CSS custom properties rather than hard-coded colors, enabling theme switching.
- **Three integrations** are loaded in order: MDX support, Pagefind search indexing, and HTML minification.
- **Pagefind is marked as a Vite external** — it is injected at build time as a static asset, not bundled by Rollup.

### tsconfig.json — path aliases

TypeScript is configured with path aliases so imports stay clean throughout the project.

```bash
cat tsconfig.json
```

```output
{
	"extends": "astro/tsconfigs/strict",
	"include": [".astro/types.d.ts", "**/*"],
	"exclude": ["dist"],
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@layouts/*": ["src/layouts/*"],
			"@components/*": ["src/components/*"],
			"@css/*": ["src/css/*"],
			"@utils/*": ["src/utils/*"],
			"@images/*": ["src/images/*"],
			"@appTypes/*": ["src/types/*"],
		},
	},
}
```

These aliases mean `import BaseLayout from "@layouts/BaseLayout.astro"` resolves to `src/layouts/BaseLayout.astro`. This avoids brittle relative paths like `../../layouts/BaseLayout.astro` in deeply nested pages.

### postcss.config.cjs — fluid typography

PostCSS is configured with the Utopia plugin for fluid, viewport-responsive type and spacing scales.

```bash
cat postcss.config.cjs
```

```output
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
	plugins: [
		require('postcss-utopia')({
			minWidth: 320, // 20rem
			maxWidth: 1168, // 73rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
```

The Utopia plugin generates `clamp()` functions for font sizes and spacing that fluidly scale between a 320px minimum and 1168px maximum viewport. This replaces media-query breakpoints with a single smooth scale.

## 2. Content Schema — content.config.ts

Astro Content Collections define the shape of every piece of content. This file uses Zod for runtime validation of frontmatter.

```bash
cat src/content.config.ts
```

```output
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";
/* https://github.com/withastro/astro/blob/main/packages/astro-rss/src/schema.ts */

const baseCollectionFields = {
	pubDate: z
		.union([z.string(), z.number(), z.date()])
		.transform((value) => new Date(value))
		.refine((value) => !isNaN(value.getTime())),
	tags: z.array(z.string()),
	draft: z.boolean().optional(),
};

const notes = defineCollection({
	loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdx}" }),
	schema: rssSchema.extend(baseCollectionFields).transform((entry) => ({
		...entry,
		categories: entry.tags ?? [],
	})),
});

const articles = defineCollection({
	loader: glob({ base: "./src/data/articles", pattern: "**/*.{md,mdx}" }),
	schema: rssSchema
		.extend({
			...baseCollectionFields,
			title: z.string(),
			updatedDate: z
				.union([z.string(), z.number(), z.date()])
				.transform((value) => new Date(value))
				.refine((value) => !isNaN(value.getTime()))
				.optional(),
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

const links = defineCollection({
	loader: glob({ base: "./src/data/links", pattern: "**/*.{md,mdx}" }),
	schema: rssSchema
		.extend({
			...baseCollectionFields,
			title: z.string(),
			link: z.string(),
			via: z.object({ url: z.string().url(), label: z.string() }).optional(),
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

const books = defineCollection({
	loader: file("src/data/books.json"),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		subtitle: z.string().optional(),
		author: z.string(),
		cover: z.string(),
		tags: z.array(z.string()),
		status: z.enum(["unread", "read", "reading"]).default("unread"),
		dominantColor: z.string(),
	}),
});

export const collections = { notes, articles, links, books };
```

Four collections are defined:

1. **notes** — short-form posts. Loaded via `glob()` from `src/data/notes/**/*.{md,mdx}`. Schema extends the RSS base schema with `pubDate`, `tags`, and optional `draft`. A Zod `.transform()` maps `tags` to `categories` for RSS compatibility.

2. **articles** — long-form posts. Same pattern as notes but adds a required `title` and optional `updatedDate`.

3. **links** — curated external links. Adds `title`, `link` (the external URL), and optional `via` (an object with `url` and `label` for attribution).

4. **books** — a JSON file (`src/data/books.json`), not Markdown. Each book has a `status` enum of `unread`, `read`, or `reading` and a `dominantColor` for placeholder styling.

Notice the `baseCollectionFields` object is shared across the three Markdown collections. The `pubDate` field accepts strings, numbers, or Date objects and normalizes them all to `Date` via `.transform()` + `.refine()`. This is defensive — it ensures dates are always valid regardless of how the author writes them in frontmatter.

### Sample content frontmatter

Here is what actual content looks like in each collection. First, a note:

```bash
head -10 src/data/notes/cascade/index.md
```

```output
---
pubDate: "2026-03-29T17:36+0530"
tags:
  - "css"
  - "cascade"
---

I built a [visual explainer of the CSS Cascade](https://cascade.arpit.codes/), the algorithm that determines the "winning value" from a list of competing declarations.


```

```bash
head -12 src/data/articles/transparent-borders/index.mdx
```

```output
---
title: Transparent borders
pubDate: 2024-05-12
tags:
  - 'accessibility'
  - 'high-contrast-mode'
  - 'design-systems'
  - 'css'
  - 'dave-rupert'
  - 'brad-frost'
---

```

And a link entry, which includes the external URL and optional attribution:

```bash
head -15 src/data/links/html-web-components.md
```

```output
---
title: "Adactio: Journal—HTML web components"
link: https://adactio.com/journal/20618
pubDate: 2024-06-25
tags:
  - "web-components"
  - "custom-elements"
  - "progressive-enhancement"
  - "jeremy-keith"
---

Jeremy Keith discusses what makes a custom element an HTML web component.

> If your custom element is empty, it’s not an HTML web component. But if you’re using a custom element to extend existing markup, that’s an HTML web component.
>
```

The `link` field holds the external URL. The `via` field (not shown here) would look like `via: { url: "https://example.com", label: "Example" }` to credit where the link was discovered.

Now let's see a snippet of the books JSON:

```bash
head -28 src/data/books.json
```

```output
[
	{
		"id": "1984",
		"title": "1984",
		"author": "George Orwell",
		"tags": ["Classics", "Dystopia", "Politics", "Fiction"],
		"status": "read",
		"cover": "/src/images/book-covers/1984.jpg",
		"dominantColor": "#f85808"
	},
	{
		"id": "a-life-in-words",
		"title": "A Life In Words",
		"subtitle": "Memoirs",
		"author": "Ismat Chughtai (Tr. Asaduddin)",
		"tags": ["Biography", "Autobiography", "India", "Non-fiction"],
		"cover": "/src/images/book-covers/a-life-in-words.jpg",
		"dominantColor": "#583838"
	},
	{
		"id": "a-short-history-of-nearly-everything",
		"title": "A Short History of Nearly Everything",
		"author": "Bill Bryson",
		"tags": ["Popular science", "Non-fiction"],
		"cover": "/src/images/book-covers/a-short-history-of-nearly-everything.jpeg",
		"dominantColor": "#283878"
	},
	{
```

Books are a flat JSON array. Each book has a `dominantColor` used as a placeholder background while the cover image loads, and a `status` that determines whether it appears in the library (read) or antilibrary (unread) page.

## 3. Constants and Types

### consts.ts — site-wide strings

All page titles and descriptions live in one file, keeping copy centralized.

```bash
cat src/consts.ts
```

```output
export const SITE_TITLE = "Arpit's Blog";
export const SITE_DESCRIPTION =
	'The online home of Arpit Agrawal, a web designer-developer from India.';

export const NOTES_TITLE = "Notes | Arpit's Blog";
export const NOTES_DESCRIPTION =
	'Brief notes from Arpit Agrawal on everything he is reading, learning and observing.';

export const ARTICLES_TITLE = "Articles | Arpit's Blog";
export const ARTICLES_DESCRIPTION =
	'Long form articles from Arpit Agrawal, a web designer-developer from India.';

export const LINKS_TITLE = "Links | Arpit's Blog";
export const LINKS_DESCRIPTION =
	'Hand-picked links from the depths of the interweb by Arpit Agrawal.';

export const LIBRARY_TITLE = "Library | Arpit's Blog";
export const LIBRARY_DESCRIPTION = 'Books owned and read by Arpit Agrawal.';

export const ANTILIBRARY_TITLE = "Antilibrary | Arpit's Blog";
export const ANTILIBRARY_DESCRIPTION =
	'Books owned but not yet read by Arpit Agrawal.';

export const SEARCH_TITLE = "Search | Arpit's Blog";
export const SEARCH_DESCRIPTION =
	'Search across notes, articles and links published by Arpit Agrawal.';

export const TAGS_TITLE = "Tags | Arpit's Blog";
export const TAGS_DESCRIPTION =
	'Browse all tags used across Arpit Agrawal’s notes, articles, and links.';

export const ARCHIVE_TITLE = "Archive | Arpit's Blog";
export const ARCHIVE_DESCRIPTION =
	'Browse the complete archive of notes, articles, and links published by Arpit Agrawal, grouped by year and month.';
```

Each section of the site has its own title/description pair. These flow into `<title>` and `<meta name="description">` tags via the `BaseHead` component (we will see this later).

### entries.ts — the type system

The blog defines a small but important type layer for enhanced entries.

```bash
cat src/types/entries.ts
```

```output
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
```

When entries are loaded from Astro's content collections, they come as raw `CollectionEntry<T>` objects. The utility functions (next section) enhance them with three additional properties:

- **`absoluteURL`** — the full URL like `https://arpit.blog/notes/2026/03/cascade/`
- **`relativeURL`** — the path like `/notes/2026/03/cascade/`
- **`Content`** — the rendered Astro component for the Markdown body

`AnyEntry` is a union type that lets feed components accept notes, articles, or links interchangeably.

## 4. Utilities — The Data Pipeline

This is the heart of how content flows from Markdown files into rendered pages. Three utility files handle loading, formatting, merging, and date display.

### collection.ts — loadAndFormatCollection()

This is the most important utility. It loads a content collection, filters drafts, renders Markdown to HTML, and computes URLs.

```bash
cat src/utils/collection.ts
```

```output
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
```

Step by step:

1. **`getCollection(name)`** — Astro's built-in function loads all entries from the named collection.
2. **Draft filtering** — In production (`import.meta.env.PROD`), entries with `draft: true` are excluded. In dev mode, everything is visible.
3. **`render(entry)`** — Each entry is rendered from Markdown/MDX into an Astro `Content` component. This happens via `Promise.all` for parallelism.
4. **URL computation** — The `pubDate` is parsed to extract `year` and `month`, building URLs like `2026/03/cascade/`. The `relativeURL` omits the collection prefix; `absoluteURL` includes it (e.g., `/notes/2026/03/cascade/`).
5. **Sorting** — Entries are sorted newest-first by `pubDate`.

The generic `<T extends "notes" | "articles" | "links">` means this single function works for all three collections while preserving type safety.

### loadAllEntries.ts — merging all collections

```bash
cat src/utils/loadAllEntries.ts
```

```output
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
```

This is used by the homepage and archive pages where all three content types are interleaved chronologically. It loads all three collections in parallel via `Promise.all`, merges them into a single array, and re-sorts by date.

### date.js — Indian locale formatting

```bash
cat src/utils/date.js
```

```output
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
```

All dates on the site display in Indian English locale (`en-IN`) with the `Asia/Kolkata` timezone. The `Intl.DateTimeFormat` instance is created once and reused for every call — this is a standard performance pattern since creating formatters is expensive.

## 5. Layouts — Page Shells

Layouts are the outermost wrappers that define the HTML structure of each page type. There are three.

### BaseLayout.astro — the root HTML document

```bash
cat src/layouts/BaseLayout.astro
```

```output
---
import type { ComponentProps } from 'astro/types';
import BaseHead from '@components/BaseHead.astro';
import SkipLink from '@components/SkipLink.astro';

type Props = ComponentProps<typeof BaseHead> & {
	bodyClass?: string;
};

const {
	pageTitle,
	pageDesc,
	ogLocale,
	ogType,
	socialImageURL,
	socialImageAlt,
	canonicalURL,
	bodyClass,
} = Astro.props;
---

<!doctype html>
<html lang="en" class="no-js">
	<head>
		<BaseHead
			pageTitle={pageTitle}
			pageDesc={pageDesc}
			ogLocale={ogLocale}
			ogType={ogType}
			socialImageURL={socialImageURL}
			socialImageAlt={socialImageAlt}
			canonicalURL={canonicalURL}
		/>
	</head>
	<body class={bodyClass}>
		<SkipLink />
		<slot />
	</body>
</html>
```

This is intentionally minimal. It provides:

- The `<!doctype html>` and `<html lang="en">` shell
- A `<BaseHead>` component (handles all `<head>` content — meta tags, fonts, styles)
- A `<SkipLink>` for accessibility (lets keyboard users jump past navigation)
- A `<slot />` where page content is injected
- A `class="no-js"` on `<html>` that gets toggled by client-side scripts for progressive enhancement
- An optional `bodyClass` prop for page-specific styling

Every page on the site ultimately wraps its content in this layout.

### EntryPage.astro — individual content pages

```bash
cat src/layouts/EntryPage.astro
```

```output
---
import BaseLayout from '@layouts/BaseLayout.astro';
import BannerText from '@components/BannerText.astro';
import SiteHeader from '@components/SiteHeader.astro';
import BackLink from '@components/BackLink.astro';
import PubDate from '@components/PubDate.astro';
import UpdatedDate from '@components/UpdatedDate.astro';
import LinkVia from '@components/LinkVia.astro';
import TagList from '@components/TagList.astro';
import EntryActions from '@components/EntryActions.astro';
import Aside from '@components/Aside.astro';

import { SITE_DESCRIPTION } from 'src/consts';

const {
	pageTitle, // string
	entry, // CollectionEntry
	Content, // from render(entry)
} = Astro.props;
---

<BaseLayout
	bodyClass="entry-page"
	pageTitle={pageTitle}
	pageDesc={SITE_DESCRIPTION}
>
	<BannerText />
	<div class="page">
		<div>
			<SiteHeader />
			<div class="center pi-space-m">
				<div class="align-self-stretch">
					<main id="main" class="pb-space-m">
						<article class="stack">
							{
								entry.collection === 'notes' && (
									<h1 class="visually-hidden">
										Note - <PubDate as="span" date={entry.data.pubDate} />
									</h1>
								)
							}
							{entry.collection === 'articles' && <h1>{entry.data.title}</h1>}
							{
								entry.collection === 'links' && (
									<h1 class="link-entry-title heading-3">
										<a href={entry.data.link}>{entry.data.title}</a>
									</h1>
								)
							}
							<div
								class="entry-content flow"
								data-pagefind-body
								data-pagefind-meta={`date:${entry.data.pubDate}`}
								data-pagefind-filter={`collection:${entry.collection}`}
							>
								<Content />
							</div>
							<footer class="cluster gap-2xs text-step--1">
								{
									entry.data.updatedDate ? (
										<Fragment>
											<del>
												<PubDate as="span" date={entry.data.pubDate} />
											</del>
											<span aria-hidden="true">•</span>
											<ins>
												<UpdatedDate date={entry.data.updatedDate} />
											</ins>
										</Fragment>
									) : (
										<PubDate date={entry.data.pubDate} />
									)
								}
								{
									!!entry.data.via && (
										<LinkVia
											url={entry.data.via.url}
											label={entry.data.via.label}
										/>
									)
								}
							</footer>
							<footer
								class="stack gap-2xs text-step--1 place-self-end text-align-end"
							>
								{!!entry.data.tags && <TagList tags={entry.data.tags} />}
							</footer>
						</article>
					</main>
					<div
						class="entry-actions text-step--1"
						role="region"
						aria-label="Entry actions"
					>
						<EntryActions entryTitle={entry.data.title} />
					</div>
					<BackLink />
				</div>
			</div>
		</div>
		<Aside />
	</div>
</BaseLayout>
```

This layout wraps `BaseLayout` and adds the full structure for a note, article, or link detail page. Key design decisions:

- **Collection-aware heading**: The `h1` renders differently for each type. Notes have a visually-hidden heading (since they have no title — just a date). Articles get a plain `h1`. Links get a heading that is itself an anchor to the external URL.
- **Pagefind attributes**: `data-pagefind-body` marks the content for search indexing. `data-pagefind-meta` and `data-pagefind-filter` attach metadata (date and collection type) so search results can display them.
- **Updated date handling**: If `updatedDate` exists, the original date is shown as `<del>` (strikethrough) and the updated date as `<ins>`.
- **`<Aside />`** renders the sidebar (search, about, socials, currently reading).
- **`<EntryActions />`** provides sharing and reply functionality.

### BookGallery.astro — library and antilibrary

```bash
cat src/layouts/BookGallery.astro
```

```output
---
import BaseLayout from '@layouts/BaseLayout.astro';
import BookCover from '@components/BookCover.astro';

import { getCollection } from 'astro:content';
import { slug } from 'github-slugger';

type Props = {
	pageTitle: string;
	pageDesc: string;
	sectionDesc: string;
	filterStatuses: string[];
};

const { pageTitle, pageDesc, sectionDesc, filterStatuses } = Astro.props;

// Determine which page we're on
const path = Astro.url.pathname;
const isLibraryPage = path.includes('/library/');

// Fetch and filter books
const books = await getCollection('books', ({ data }) =>
	filterStatuses.includes(data.status),
);

const uniqueTags = [...new Set(books.map((entry) => entry.data.tags).flat())];
---

<BaseLayout bodyClass="book-gallery" pageTitle={pageTitle} pageDesc={pageDesc}>
	<div class="flow wrapper pb-space-m">
		<a class="heading-3" href="/"> Home </a>
		<main class="flow" id="main">
			<header class="flow">
				<div class="heading-group cluster gap-2xs">
					{
						isLibraryPage ? (
							<Fragment>
								<h1 aria-describedby="section-desc">Library</h1>
								<span class="text-box-trim" aria-hidden="true">
									/
								</span>
								<a class="heading-1 text-box-trim" href="/antilibrary/">
									Antilibrary
								</a>
							</Fragment>
						) : (
							<Fragment>
								<a class="heading-1 text-box-trim" href="/library/">
									Library
								</a>
								<span class="text-box-trim" aria-hidden="true">
									/
								</span>
								<h1 aria-describedby="section-desc">Antilibrary</h1>
							</Fragment>
						)
					}
				</div>
				<p
					id="section-desc"
					class="text-step-1 text-box-trim"
					aria-hidden="true"
				>
					{sectionDesc}
				</p>
			</header>
			<fieldset class="book-filters" disabled>
				<legend class="heading-4">Filter</legend>
				<div class="cluster">
					<div class="btn cluster gap-0">
						<input name="filter" id="all" type="radio" value="all" checked="" />
						<label class="text-box-trim" for="all">All</label>
					</div>
					{
						uniqueTags.map((tag) => {
							const tagID = `tag-${slug(tag)}`;
							return (
								<div class="btn cluster gap-0">
									<input name="filter" id={tagID} type="radio" value={tag} />
									<label class="text-box-trim" for={tagID}>
										{tag}
									</label>
								</div>
							);
						})
					}
				</div>
			</fieldset>
			<h2 id="books-results-count" aria-live="polite" class="visually-hidden">
				{books.length} books
			</h2>
			<ul class="book-list grid" role="list">
				{
					books.map((item, index) => {
						const viewTransitionName = `book-${item.id}`;
						const randomNum = Math.random() * (0.5 - -0.5) - 0.5;
						const rotationAngle = `calc(${randomNum} * 1deg)`;
						return (
							<li
								data-tags={item.data.tags}
								style={{
									'view-transition-name': viewTransitionName,
								}}
							>
								<div class="stack gap-2xs">
									<h2 class="heading-3 leading-snug">{item.data.title}</h2>
									<p class="text-step--1">{item.data.author}</p>
								</div>
								<div
									class="book-wrapper"
									style={{
										'--dominant-color': item.data.dominantColor,
										rotate: rotationAngle,
									}}
								>
									<div>
										<div class="cover">
											<BookCover
												imagePath={item.data.cover}
												widths={[315, 630]}
												priority={index < 12}
												sizes="(width < 21.5rem) 100vw, (width <= 32.5rem) 50vw, (width < 44.25rem) 33vw, (width < 56.5rem) 25vw, (width < 69.5rem) 20vw, 16.67vw"
											/>
										</div>
									</div>
								</div>
							</li>
						);
					})
				}
			</ul>
		</main>
	</div>
</BaseLayout>

<script src="/src/scripts/book-filters.js"></script>
```

This layout is shared by the `/library/` and `/antilibrary/` pages. Notable features:

- **Dynamic heading**: The current page's name is an `<h1>`, the other is a link. So on the Library page you see "**Library** / [Antilibrary](/antilibrary/)".
- **Tag filtering**: Unique tags are extracted from the filtered books and rendered as radio buttons in a `<fieldset>`. The fieldset starts `disabled` — JavaScript enables it (progressive enhancement).
- **Random rotation**: Each book cover gets a slight random rotation (`calc(${randomNum} * 1deg)`) for a natural, "scattered on a table" look.
- **`dominantColor`**: Set as a CSS custom property `--dominant-color` on each book wrapper, providing a background placeholder while the cover image loads.
- **Priority loading**: The first 12 books get `priority={true}` for eager image loading; the rest are lazy-loaded.
- **View Transitions**: Each book has a `view-transition-name` for animated filtering.

## 6. Components

Components are small, focused Astro files that compose together. We will walk through the most important ones in the order they appear when rendering a page.

### BaseHead.astro — everything in `<head>`

```bash
cat src/components/BaseHead.astro
```

```output
---
import { join } from 'node:path';
import { AstroFont } from 'astro-font';
import stylesUrl from '@css/style.css?url';
// import printStylesUrl from "@css/print.css?url";

interface Props {
	pageTitle: string;
	pageDesc?: string;
	ogLocale?: string;
	ogType?: string;
	socialImageURL?: URL;
	socialImageAlt?: string;
	canonicalURL?: URL;
}

const {
	pageTitle,
	pageDesc,
	ogLocale = 'en_IN',
	ogType = 'article',
	socialImageURL = new URL('/images/opengraph.png', Astro.url.origin),
	socialImageAlt = '',
	canonicalURL = new URL(Astro.url.pathname, Astro.site),
} = Astro.props;
---

<!-- https://www.matuzo.at/blog/html-boilerplate/ -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{pageTitle}</title>

<!-- If a browser does not support JS modules, then it is a browser that does not support modern JavaScript, therefore it won’t get any JavaScript and has to live with the plain old, even if reduced but still usable, HTML-only experience -->
<!-- Processing of the script contents is deferred -->
<!-- Use the js class in CSS, if the styling of a component is different, when JS is active. -->
<script type="module" is:inline>
	document.documentElement.classList.remove('no-js');
	document.documentElement.classList.add('js');
</script>

<AstroFont
	config={[
		{
			name: 'Figtree',
			src: [
				{
					style: 'normal',
					weight: '300 900',
					path: join(
						process.cwd(),
						'public',
						'fonts',
						'Figtree-VariableFont_wght-subset.woff2',
					),
				},
			],
			preload: false, // manually preloaded after Synchronous CSS
			display: 'swap',
			cssVariable: 'font-sans-serif',
			fallback: 'sans-serif',
			fallbackName: 'Figtree Fallback',
		},
	]}
/>

<link rel="stylesheet" href={stylesUrl} />
<!-- <link rel="stylesheet" href={printStylesUrl} media="print" /> -->

<link
	as="font"
	crossorigin=""
	rel="preload"
	href="/fonts/Figtree-VariableFont_wght-subset.woff2"
	type="font/woff2"
/>

<meta property="og:title" content={pageTitle} />
{!!pageDesc && <meta name="description" content={pageDesc} />}
{!!pageDesc && <meta property="og:description" content={pageDesc} />}
<meta property="og:type" content={ogType} />
<meta property="og:image" content={socialImageURL} />
{!!socialImageAlt && <meta property="og:image:alt" content={socialImageAlt} />}
<meta property="og:url" content={canonicalURL} />
<meta property="og:locale" content={ogLocale} />
<link rel="canonical" href={canonicalURL} />

<!--
	How To Use an Emoji as a Favicon Easily:
	https://css-tricks.com/emoji-as-a-favicon/
-->
{
	import.meta.env.DEV && (
		<link
			rel="icon"
			href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚨</text></svg>"
		/>
	)
}

{
	import.meta.env.PROD && (
		<Fragment>
			<link rel="icon" href="/favicon.ico" />
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
		</Fragment>
	)
}

<meta name="author" content="Arpit Agrawal" />
<meta name="fediverse:creator" content="arpit@indieweb.social" />
<link rel="me" href="https://indieweb.social/@arpit" />
<link rel="me" href="mailto:hello@arpit.codes" />

<meta name="robots" content="index,follow" />
<meta name="generator" content={Astro.generator} />

<link
	rel="alternate"
	type="application/rss+xml"
	title="Notes RSS"
	href={new URL('/notes/rss.xml', Astro.site)}
/>
<link
	rel="alternate"
	type="application/rss+xml"
	title="Articles RSS"
	href={new URL('/articles/rss.xml', Astro.site)}
/>
<link
	rel="alternate"
	type="application/rss+xml"
	title="Links RSS"
	href={new URL('/links/rss.xml', Astro.site)}
/>
<link
	rel="alternate"
	type="application/rss+xml"
	title="Notes, Articles and Links RSS"
	href={new URL('/rss.xml', Astro.site)}
/>
```

This is the densest component. Highlights:

- **Progressive enhancement via `no-js`/`js` toggle**: An inline `<script type="module">` swaps `no-js` for `js` on the `<html>` element. If the browser doesn't support ES modules, this never runs, and the CSS can degrade gracefully using the `no-js` class.
- **Font loading**: The Figtree variable font (weights 300-900) is configured via `AstroFont`. It's manually preloaded *after* the synchronous CSS `<link>` to avoid blocking render.
- **Stylesheet**: `@css/style.css?url` imports the CSS as a URL (Vite asset handling), generating a hashed production filename.
- **Open Graph / SEO**: Full OG meta tags with defaults (`ogLocale: "en_IN"`, `ogType: "article"`).
- **Dev vs prod favicon**: In development, a siren emoji favicon makes it obvious you're on localhost. Production uses a real `.ico` file.
- **Fediverse identity**: `<meta name="fediverse:creator">` and `<link rel="me">` establish identity for Mastodon verification.
- **Four RSS feeds**: Separate `<link rel="alternate">` tags for notes, articles, links, and a combined feed.

### SiteNav.astro — navigation with active states

```bash
cat src/components/SiteNav.astro
```

```output
---
const navLinks = [
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'Notes',
		href: '/notes/',
	},
	{
		label: 'Articles',
		href: '/articles/',
	},
	{
		label: 'Links',
		href: '/links/',
	},
];

const { pathname } = Astro.url;

// Root pages get aria-current; paginated and entry pages get data-state="active"
function getLinkState(href: string, pathname: string) {
	const normalize = (path: string) => (path.endsWith('/') ? path : path + '/');

	href = normalize(href);
	pathname = normalize(pathname);

	const isRoot = href === '/';
	const isCurrent = href === pathname;

	let isActive = false;

	if (isRoot) {
		// e.g. /2/, /3/
		isActive = /^\/\d+\/$/.test(pathname);
	} else {
		// e.g. /notes/2/, /notes/post-slug/
		isActive = pathname.startsWith(href) && pathname !== href;
	}

	return { isCurrent, isActive };
}
---

<nav class="site-nav center pi-space-m" aria-label="Main">
	<ul class="cluster align-self-stretch" role="list">
		{
			navLinks.map((link) => {
				const { isCurrent, isActive } = getLinkState(link.href, pathname);
				return (
					<li class="nav-item heading-3">
						<a
							class="text-box-trim"
							href={link.href}
							aria-current={isCurrent ? 'page' : null}
							data-state={isActive ? 'active' : null}
						>
							{link.label}
						</a>
					</li>
				);
			})
		}
	</ul>
</nav>
```

The nav uses two kinds of active indication:

- **`aria-current="page"`** — set when the URL exactly matches the link (e.g., you're on `/notes/` and the link is `/notes/`). Screen readers announce this as "current page".
- **`data-state="active"`** — set when you're on a sub-page (e.g., `/notes/2026/03/cascade/`). Visually styled the same but semantically different.

The `getLinkState()` function handles the special case of the homepage, where paginated URLs like `/2/` and `/3/` should highlight "Home".

### PaginatedEntries.astro — paginated feeds

```bash
cat src/components/PaginatedEntries.astro
```

```output
---
import EntryList from '@components/EntryList.astro';

const { page, entries } = Astro.props;
---

<div>
	<EntryList entries={entries} />
</div>
{
	page.lastPage > 1 && (
		<nav class="pagination-control text-box-trim" aria-label="Pagination">
			<div class="center p-space-m">
				<div class="cluster align-self-stretch">
					{page.url.prev && (
						<a href={page.url.prev} rel="prev" class="heading-3 text-box-trim">
							&larr; Newer entries
						</a>
					)}
					{page.url.next && (
						<a href={page.url.next} rel="next" class="heading-3 text-box-trim">
							Older entries &rarr;
						</a>
					)}
				</div>
			</div>
		</nav>
	)
}
```

Simple composition: it renders an `EntryList` and conditionally shows prev/next pagination links. The links use `rel="prev"` and `rel="next"` for SEO and accessibility. Pagination is hidden entirely if there is only one page.

### EntryList.astro — rendering a list of entries

```bash
cat src/components/EntryList.astro
```

```output
---
import type { AnyEntry } from '@appTypes/entries';
import PubDate from '@components/PubDate.astro';
import H2 from '@components/H2.astro';
import H3 from '@components/H3.astro';
import H4 from '@components/H4.astro';
import H5 from '@components/H5.astro';
import H6 from '@components/H6.astro';

interface Props {
	entries: AnyEntry[];
}

const { entries } = Astro.props;

// Custom heading components for offset
const headingComponents = {
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
};
---

<ul role="list">
	{
		entries.map((entry) => {
			return (
				<li class="entry-item">
					<div class="center p-space-m">
						<article class="stack align-self-stretch">
							{entry.collection === 'notes' && (
								<h2 class="visually-hidden">
									Note - <PubDate as="span" date={entry.data.pubDate} />
								</h2>
							)}
							{entry.collection === 'articles' && (
								<h2>
									<a href={entry.absoluteURL}>{entry.data.title}</a>
								</h2>
							)}
							{entry.collection === 'links' && (
								<h2 class="link-entry-title heading-3">
									<a href={entry.data.link}>{entry.data.title}</a>
								</h2>
							)}
							<div class="entry-content flow">
								<entry.Content components={headingComponents} />
							</div>
							<footer class="cluster text-step--1">
								<a
									class="text-box-trim"
									href={entry.absoluteURL}
									rel="bookmark"
								>
									<PubDate as="span" date={entry.data.pubDate} />
								</a>
							</footer>
						</article>
					</div>
				</li>
			);
		})
	}
</ul>
```

This is the workhorse of the feed pages. For each entry it:

1. **Renders collection-specific headings** — same pattern as `EntryPage`: notes get a visually-hidden heading, articles get a linked title, links get an external link.
2. **Renders content with heading offset** — `<entry.Content components={headingComponents} />` passes custom heading components (H2 through H6) that shift heading levels down by one. This is important because the entry's own `h1` in Markdown becomes `h2` in the list context, preventing heading hierarchy violations.
3. **Permalink via date** — The footer links to the entry's permanent URL using the formatted date as link text, with `rel="bookmark"`.

### Aside.astro — the sidebar

```bash
cat src/components/Aside.astro
```

```output
---
import AboutSite from '@components/AboutSite.astro';
import Search from '@components/Search.astro';
import Subscribe from '@components/Subscribe.astro';
import Socials from '@components/Socials.astro';

// Determine which page we're on
const path = Astro.url.pathname;
const isSearchPage = path.includes('/search/');
---

<aside class="sidebar container-type-inline" id="aside">
	<AboutSite />
	{!isSearchPage && <Search />}
	<Subscribe />
	<Socials />
	<slot />
</aside>
```

The sidebar composes four sub-components: author bio, search form, RSS subscription links, and social links. The search widget is hidden on the search page itself (to avoid redundancy). The `<slot />` at the end allows pages to inject additional sidebar content (like "Currently Reading" on the homepage).

### EntryActions.astro — sharing and replying

```bash
cat src/components/EntryActions.astro
```

```output
---
import CopyToClipboard from '@components/CopyToClipboard.astro';
import MastodonShare from '@components/MastodonShare.astro';

const { entryTitle } = Astro.props;

const copyText = `${new URL(Astro.url.pathname, Astro.site)}`;
const blueskyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${Astro.url}`)}`;
const mailtoLink = `mailto:hello@arpit.codes?subject=${encodeURIComponent('Re: ' + entryTitle)}&body=${encodeURIComponent(`${Astro.url}`)}`;
---

<div class="share-feedback repel pb-space-m">
	<p class="text-box-trim">Share:</p>
	<div class="cluster gap-s">
		<a class="text-box-trim" href={blueskyLink}>Bluesky</a>
		<MastodonShare />
		<CopyToClipboard text={copyText}>
			Copy link
			<span class="visually-hidden">To This Entry</span>
		</CopyToClipboard>
	</div>
</div>
<div class="repel pb-space-m">
	<p class="text-box-trim">Reply:</p>
	<a class="text-box-trim" href={mailtoLink}>hello@arpit.codes</a>
</div>
```

Sharing options are built server-side using the current URL:

- **Bluesky** — a direct link to the Bluesky compose intent with the URL pre-filled.
- **Mastodon** — a custom component (uses JavaScript to prompt for the user's instance).
- **Copy link** — a custom web component (`CopyToClipboard`) that copies the URL to clipboard.
- **Reply** — a `mailto:` link with a pre-filled subject line and the entry URL in the body.

### PubDate.astro — polymorphic date component

```bash
cat src/components/PubDate.astro
```

```output
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import { formatDate } from '@utils/date';

// 1. Combine your custom props with the Polymorphic type
type Props<Tag extends HTMLTag> = Polymorphic<{
	as: Tag;
	date: Date;
}>;

// 2. Extract props with the generic Tag
const { as: Tag = 'p', date } = Astro.props;
---

<Tag class="pub-date text-box-trim">
	<span class="visually-hidden">Posted on</span>
	<time datetime={date.toISOString()}>
		{formatDate(date)}
	</time>
</Tag>
```

This demonstrates Astro's polymorphic component pattern. The `as` prop controls which HTML element is rendered — `<p>` by default, but `<span>` when used inline (like inside a heading). The `<time>` element has a machine-readable `datetime` attribute (ISO 8601) alongside the human-readable Indian-locale formatted text. A visually-hidden "Posted on" prefix makes the date meaningful to screen readers.

## 7. Pages and Routing

Astro's file-based routing maps `src/pages/` to URLs. Let's see the full route map.

```bash
find src/pages -type f | sort
```

```output
src/pages/[...page].astro
src/pages/antilibrary/index.astro
src/pages/archive.astro
src/pages/archive/[year]/[month].astro
src/pages/articles/[...page].astro
src/pages/articles/[...slug].astro
src/pages/articles/rss.xml.js
src/pages/library/index.astro
src/pages/links/[...page].astro
src/pages/links/[...slug].astro
src/pages/links/rss.xml.js
src/pages/notes/[...page].astro
src/pages/notes/[...slug].astro
src/pages/notes/rss.xml.js
src/pages/rss.xml.js
src/pages/search/index.astro
src/pages/tags/[tag].astro
src/pages/tags/index.astro
```

Each file maps to a route:

| File | URL | Purpose |
|------|-----|---------|
| `[...page].astro` | `/`, `/2/`, `/3/` | Paginated homepage (all entries) |
| `notes/[...page].astro` | `/notes/`, `/notes/2/` | Paginated notes feed |
| `notes/[...slug].astro` | `/notes/2026/03/cascade/` | Individual note |
| `articles/[...page].astro` | `/articles/`, `/articles/2/` | Paginated articles feed |
| `articles/[...slug].astro` | `/articles/2024/05/transparent-borders/` | Individual article |
| `links/[...page].astro` | `/links/`, `/links/2/` | Paginated links feed |
| `links/[...slug].astro` | `/links/2024/06/html-web-components/` | Individual link |
| `*/rss.xml.js` | `/rss.xml`, `/notes/rss.xml`, etc. | RSS feeds |
| `archive.astro` | `/archive/` | Archive index by year |
| `archive/[year]/[month].astro` | `/archive/2024/05/` | Monthly archive |
| `tags/index.astro` | `/tags/` | Tag cloud |
| `tags/[tag].astro` | `/tags/css/` | Entries for a tag |
| `library/index.astro` | `/library/` | Read books |
| `antilibrary/index.astro` | `/antilibrary/` | Unread books |
| `search/index.astro` | `/search/` | Search page |

### The homepage — [...page].astro

```bash
cat 'src/pages/[...page].astro'
```

```output
---
import type { GetStaticPaths } from 'astro';
import { loadAllEntries } from '@utils/loadAllEntries';
import { render } from 'astro:content';

import BaseLayout from '@layouts/BaseLayout.astro';
import BannerText from '@components/BannerText.astro';
import SiteHeader from '@components/SiteHeader.astro';
import PaginatedEntries from '@components/PaginatedEntries.astro';
import Aside from '@components/Aside.astro';
import CurrentlyReading from '@components/CurrentlyReading.astro';

import { SITE_DESCRIPTION, SITE_TITLE } from 'src/consts';

export const getStaticPaths = (async ({ paginate }) => {
	const allEntries = await loadAllEntries();
	return paginate(allEntries, { pageSize: 20 });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
const entries = await Promise.all(
	page.data.map(async (entry) => {
		const { Content } = await render(entry);
		return { ...entry, Content };
	}),
);

const pageTitle =
	page.currentPage > 1
		? `Page ${page.currentPage} - ${SITE_TITLE}`
		: SITE_TITLE;
---

<BaseLayout
	bodyClass="homepage feed-page"
	{pageTitle}
	pageDesc={SITE_DESCRIPTION}
	ogType="website"
>
	<BannerText as="h1" />
	<div class="page">
		<div>
			<SiteHeader />
			<main id="main">
				<PaginatedEntries page={page} entries={entries} />
			</main>
		</div>
		<Aside>
			<CurrentlyReading />
		</Aside>
	</div>
</BaseLayout>
```

This is the most important page. The flow:

1. **`getStaticPaths`** runs at build time. It calls `loadAllEntries()` to get every note, article, and link, then passes them to Astro's `paginate()` with 20 entries per page. Astro generates `/`, `/2/`, `/3/`, etc.
2. **Re-rendering content**: The paginated entries need fresh `Content` components (since `paginate()` serializes data), so each entry is re-rendered via `render(entry)`.
3. **Dynamic title**: Page 1 shows "Arpit's Blog", subsequent pages show "Page 2 - Arpit's Blog".
4. **Layout composition**: `BannerText` renders the site logo as an `<h1>`, then `SiteHeader` (which contains `SiteNav`), the paginated entries as `<main>`, and the sidebar with `CurrentlyReading` injected via the slot.

### Individual entry pages — [collection]/[...slug].astro

All three collection types follow the same pattern. Here's the notes version:

```bash
cat 'src/pages/notes/[...slug].astro'
```

```output
---
import { loadAndFormatCollection } from '@utils/collection';
import type { EnhancedEntry } from '@appTypes/entries';
import { render } from 'astro:content';
import { formatDate } from '@utils/date';
import EntryPage from '@layouts/EntryPage.astro';
import { NOTES_TITLE } from 'src/consts';

export async function getStaticPaths() {
	const posts = await loadAndFormatCollection('notes');
	return posts.map((post) => ({
		params: { slug: post.relativeURL },
		props: post,
	}));
}

type Props = EnhancedEntry<'notes'>;
const entry = Astro.props;
const { Content } = await render(entry);

const noteTitle = `${formatDate(entry.data.pubDate)} - ${NOTES_TITLE}`;
---

<EntryPage pageTitle={noteTitle} entry={entry} Content={Content} />
```

Each entry page:

1. Calls `loadAndFormatCollection()` in `getStaticPaths()` to get all entries.
2. Maps each entry to a route using `relativeURL` as the slug — this produces URLs like `2026/03/cascade/` (the `[...slug]` rest parameter captures the slashes).
3. Passes the entire entry as props, so the page component receives it directly.
4. Re-renders the entry to get a fresh `Content` component.
5. Delegates all rendering to the `EntryPage` layout.

The articles and links versions are nearly identical, just with different collection names and title formatting.

### RSS feeds — rss.xml.js

```bash
cat src/pages/notes/rss.xml.js
```

```output
// https://blog.damato.design/posts/astro-rss-mdx/
import rss from "@astrojs/rss";
import { loadAndFormatCollection } from "@utils/collection";
import { render } from "astro:content";
import { NOTES_TITLE, NOTES_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

export async function GET(context) {
	let baseUrl = context.site.origin;

	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const allEntries = await loadAndFormatCollection("notes");

	const items = [];

	for (const entry of allEntries) {
		const { Content } = await render(entry);
		const html = await container.renderToString(Content);

		// Absolutify image + link paths
		const absolutified = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split("=")[0]}="${baseUrl}${path}"`,
		);

		items.push({
			...entry.data,
			link: entry.absoluteURL,
			description: absolutified,
		});
	}

	return rss({
		title: NOTES_TITLE,
		description: NOTES_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
```

RSS generation is one of the most sophisticated parts of the codebase. It uses Astro's experimental **Container API** to render each entry's `Content` component to an HTML string at build time. The resulting HTML is then processed with a regex to convert relative paths (`/images/foo.png`) to absolute URLs (`https://arpit.blog/images/foo.png`), ensuring images and links work in RSS readers.

This is necessary because Astro components cannot be directly serialized to strings — the Container API creates a minimal Astro runtime to render them outside the normal page context.

### Archive page

```bash
cat src/pages/archive.astro
```

```output
---
import { loadAllEntries } from '@utils/loadAllEntries';
import BaseLayout from '@layouts/BaseLayout.astro';
import BannerText from '@components/BannerText.astro';
import SiteHeader from '@components/SiteHeader.astro';
import FeedHeader from '@components/FeedHeader.astro';
import Aside from '@components/Aside.astro';
import { ARCHIVE_TITLE, ARCHIVE_DESCRIPTION } from 'src/consts';

// Load all entries (already sorted newest → oldest)
const allEntries = await loadAllEntries();

// Group by year → month
const archive = new Map();

for (const entry of allEntries) {
	const date = entry.data.pubDate;
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const monthKey = String(month).padStart(2, '0');

	if (!archive.has(year)) archive.set(year, new Set());
	archive.get(year).add(monthKey);
}

// Convert to sorted structure
const years = Array.from(archive.keys()).sort((a, b) => b - a);
---

<BaseLayout
	bodyClass="archive-page"
	pageTitle={ARCHIVE_TITLE}
	pageDesc={ARCHIVE_DESCRIPTION}
>
	<BannerText />
	<div class="page">
		<div>
			<SiteHeader />
			<main id="main">
				<FeedHeader
					isVisuallyHidden={false}
					sectionTitle="Archive"
					sectionDesc="Browse all entries grouped by year and month."
				/>
				<div class="center pi-space-m">
					<div class="archive-list align-self-stretch">
						{
							years.map((year) => (
								<section class="align-self-stretch">
									<h2>{year}</h2>
									<ul role="list">
										{Array.from(archive.get(year))
											.sort((a, b) => Number(b) - Number(a)) // descending months
											.map((month) => {
												const label = new Intl.DateTimeFormat('en-IN', {
													month: 'long',
												}).format(new Date(year, Number(month) - 1));
												return (
													<li>
														<a href={`/archive/${year}/${month}/`}>
															<span>{label}</span>
															<span class="visually-hidden">{year}</span>
														</a>
													</li>
												);
											})}
									</ul>
								</section>
							))
						}
					</div>
				</div>
			</main>
		</div>
		<Aside />
	</div>
</BaseLayout>
```

The archive page loads all entries and groups them into a `Map<year, Set<month>>` structure, then renders a nested list of year > month links. Month names are formatted with `Intl.DateTimeFormat` using the Indian English locale. Each link points to `/archive/2024/05/` where the monthly archive page renders all entries for that month.

### Tags page

```bash
cat src/pages/tags/index.astro
```

```output
---
import { loadAllEntries } from '@utils/loadAllEntries';
import BaseLayout from '@layouts/BaseLayout.astro';
import BannerText from '@components/BannerText.astro';
import SiteHeader from '@components/SiteHeader.astro';
import Aside from '@components/Aside.astro';
import FeedHeader from '@components/FeedHeader.astro';
import { TAGS_TITLE, TAGS_DESCRIPTION } from 'src/consts';
import { slug } from 'github-slugger';

const allEntries = await loadAllEntries();

// Build Map: tag → count
const tagCountMap = new Map();
for (const entry of allEntries) {
	const tags = entry.data.tags || [];
	for (const tag of tags) {
		tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
	}
}

// Convert to array and sort alphabetically or by count (your choice)
const tagItems = [...tagCountMap.entries()].toSorted(); // DESC by count

// Get min + max
const counts = tagItems.map(([, c]) => c);
const min = Math.min(...counts);
const max = Math.max(...counts);

// Map a count to a “step” class (0 → 3)
function getStepClass(count: number) {
	if (min === max) return 'text-step-1'; // all equal

	const t = (count - min) / (max - min); // normalize 0 → 1

	// choose one: 4 levels
	if (t > 0.75) return 'text-step-6 leading-tight';
	if (t > 0.5) return 'text-step-4 leading-snug';
	if (t > 0.25) return 'text-step-2';
	return '';
}
---

<BaseLayout
	bodyClass="tag-page"
	pageTitle={TAGS_TITLE}
	pageDesc={TAGS_DESCRIPTION}
>
	<BannerText />
	<div class="page">
		<div>
			<SiteHeader />
			<main id="main">
				<FeedHeader
					isVisuallyHidden={false}
					sectionTitle="Tags"
					sectionDesc="Browse all tags used across my notes, articles, and links."
				/>
				<div class="center p-space-m">
					<ul class="multi-col align-self-stretch" role="list">
						{
							tagItems.map(([tag, count]) => (
								<li class:list={[getStepClass(count)]}>
									<p class="cluster">
										<a href={`/tags/${slug(tag)}/`} data-astro-prefetch>
											{tag}
										</a>
										<span>({count})</span>
									</p>
								</li>
							))
						}
					</ul>
				</div>
			</main>
		</div>
		<Aside />
	</div>
</BaseLayout>
```

The tag cloud is built by counting tag usage across all entries, then mapping counts to font-size classes. The `getStepClass()` function normalizes tag counts to a 0-1 range and assigns one of four typographic scales — the most-used tags appear in `text-step-6` (large), the least-used in the default size. This creates a visual weight map without any client-side JavaScript.

## 8. CSS Architecture — CUBE CSS

The site uses the CUBE CSS methodology (Composition, Utility, Block, Exception). The stylesheet is organized into distinct layers imported via a single entry point.

```bash
cat src/css/style.css
```

```output
@layer reset, theme, global, composition, blocks, utilities, exceptions;

@import url(/src/css/reset.css) layer(reset);
@import url(/src/css/theme/utopia.css) layer(theme);
@import url(/src/css/theme/color.css) layer(theme);
@import url(/src/css/theme/text-weights.css) layer(theme);
@import url(/src/css/theme/leading.css) layer(theme);
@import url(/src/css/theme/tracking.css) layer(theme);
@import url(/src/css/theme/border.css) layer(theme);
@import url(/src/css/theme/shadows.css) layer(theme);
@import url(/src/css/theme/easings.css) layer(theme);
@import url(/src/css/theme/code.css) layer(theme);
@import url(/src/css/theme/images.css) layer(theme);
@import url(/src/css/global.css) layer(global);
@import url(/src/css/composition/box.css) layer(composition);
@import url(/src/css/composition/center.css) layer(composition);
@import url(/src/css/composition/cluster.css) layer(composition);
@import url(/src/css/composition/flow.css) layer(composition);
@import url(/src/css/composition/grid.css) layer(composition);
@import url(/src/css/composition/repel.css) layer(composition);
@import url(/src/css/composition/sidebar.css) layer(composition);
@import url(/src/css/composition/stack.css) layer(composition);
@import url(/src/css/composition/wrapper.css) layer(composition);
@import url(/src/css/blocks/skip-link.css) layer(blocks);
@import url(/src/css/blocks/page.css) layer(blocks);
@import url(/src/css/blocks/banner-text.css) layer(blocks);
@import url(/src/css/blocks/site-nav.css) layer(blocks);
@import url(/src/css/blocks/feed-header.css) layer(blocks);
@import url(/src/css/blocks/entry-item.css) layer(blocks);
@import url(/src/css/blocks/entry-content.css) layer(blocks);
@import url(/src/css/blocks/entry-actions.css) layer(blocks);
@import url(/src/css/blocks/pagination-control.css) layer(blocks);
@import url(/src/css/blocks/link-entry-title.css) layer(blocks);
@import url(/src/css/blocks/mastodon-share.css) layer(blocks);
@import url(/src/css/blocks/copy-to-clipboard.css) layer(blocks);
@import url(/src/css/blocks/back-link.css) layer(blocks);
@import url(/src/css/blocks/book-list.css) layer(blocks);
@import url(/src/css/blocks/book-filters.css) layer(blocks);
@import url(/src/css/blocks/currently-reading.css) layer(blocks);
@import url(/src/css/blocks/astro-code.css) layer(blocks);
@import url(/src/css/blocks/search.css) layer(blocks);
@import url(/src/css/blocks/socials.css) layer(blocks);
@import url(/src/css/utilities/region.css) layer(utilities);
@import url(/src/css/utilities/visually-hidden.css) layer(utilities);
/*@import url(/src/css/utilities/text-fit.css) layer(utilities);*/
@import url(/src/css/utilities/spacing.css) layer(utilities);
@import url(/src/css/utilities/sizing.css) layer(utilities);
@import url(/src/css/utilities/layout.css) layer(utilities);
@import url(/src/css/utilities/typography.css) layer(utilities);
@import url(/src/css/utilities/flex-grid.css) layer(utilities);
@import url(/src/css/exceptions/share-feedback.css) layer(exceptions);
@import url(/src/css/exceptions/feed-page.css) layer(exceptions);
@import url(/src/css/exceptions/entry-page.css) layer(exceptions);
@import url(/src/css/exceptions/book-gallery.css) layer(exceptions);
@import url(/src/css/exceptions/tag-page.css) layer(exceptions);
@import url(/src/css/exceptions/archive-page.css) layer(exceptions);
@import url(/src/css/exceptions/search-with-results.css) layer(exceptions);
@import url(/src/css/exceptions/about-site.css) layer(exceptions);
```

The first line declares **CSS Cascade Layers** in explicit order:

    @layer reset, theme, global, composition, blocks, utilities, exceptions;

This means `exceptions` always wins over `utilities`, which wins over `blocks`, and so on — regardless of source order or specificity within a layer. This is a modern replacement for the old "specificity wars" problem.

The layers map to CUBE CSS:

- **reset** — CSS normalization
- **theme** — design tokens: fluid type scales (Utopia), colors, font weights, line heights, borders, shadows, easing curves
- **global** — base element styles
- **composition** — layout primitives that don't know about content: `stack` (vertical spacing), `cluster` (horizontal wrapping), `sidebar` (sidebar layout), `center` (centered container), `repel` (space-between), `flow` (vertical rhythm), `grid`, `box`, `wrapper`
- **blocks** — component-specific styles scoped by class
- **utilities** — single-purpose helpers (spacing, sizing, typography, layout, visibility)
- **exceptions** — page-level overrides and contextual variants

Let's look at a few key composition primitives.

```bash
cat src/css/composition/stack.css
```

```output
.stack {
	display: flex;
	flex-direction: column;
	gap: var(--stack-gap, var(--space-m));
	justify-content: var(--stack-vertical-alignment, flex-start);
	align-items: var(--stack-horizontal-alignment, flex-start);
}
```

```bash
cat src/css/composition/cluster.css
```

```output
.cluster {
	display: flex;
	flex-wrap: var(--cluster-wrap, wrap);
	gap: var(--cluster-gap, var(--space-s-m));
	justify-content: var(--cluster-horizontal-alignment, flex-start);
	align-items: var(--cluster-vertical-alignment, center);
}
```

```bash
cat src/css/composition/sidebar.css
```

```output
:has(> .sidebar) {
	display: flex;
	flex-wrap: wrap;
	gap: var(--sidebar-gap, var(--space-s-m));
}

.sidebar {
	flex-basis: var(--sidebar-min-width, 16rem);
	flex-grow: 1;
}

:has(> .sidebar) > :not(.sidebar) {
	flex-basis: 0;
	flex-grow: 99999;
	min-inline-size: 65%;
}

:has(> .sidebar) > :only-child,
:has(> .sidebar) > :nth-child(3) {
	--error: "Sidebar layouts must include exactly two child elements.";
	outline: var(--error-outline);
}
```

These composition primitives are content-agnostic layout tools:

- **`.stack`** — flexbox column with a configurable gap (defaults to `--space-m`). Used everywhere for vertical spacing between elements.
- **`.cluster`** — flexbox row with wrapping. Used for tags, navigation items, and any horizontal group.
- **`.sidebar`** — a clever CSS-only responsive sidebar. The `:has(> .sidebar)` parent becomes a flex container. The sidebar gets a minimum width; the main content takes remaining space with `flex-grow: 99999` and a `min-inline-size: 65%`. When the viewport is too narrow, the flex items wrap and stack vertically — no media queries needed. There's even a development-time error outline if you misuse it with the wrong number of children.

All primitives use CSS custom properties for configuration, so components can override defaults without touching the composition CSS.

### Design tokens — the Utopia fluid scale

```bash
head -45 src/css/theme/utopia.css
```

```output
:root {
	@utopia typeScale({
    minFontSize: 16,
    maxFontSize: 18,
    minTypeScale: 1.125,
    maxTypeScale: 1.2,
    positiveSteps: 6,
    negativeSteps: 2,
    relativeTo: 'viewport',
    prefix: 'step'
  });
	@utopia spaceScale({
    minSize: 16,
    maxSize: 18,
    positiveSteps: [1.5, 2, 2.5, 3, 4, 5, 6, 7],
    negativeSteps: [0.75, 0.5, 0.25, 0.125, 0.0625],
    customSizes: ['s-l', 'm-s', 's-xs', 's-5xs', 'm-5xs', 'l-5xs', 'l-m', 'xl-m', '5xs-m'],
    relativeTo: 'viewport',
    prefix: 'space',
    usePx: false,
  });
}
```

The `@utopia` directives are processed by `postcss-utopia` at build time into `clamp()` values. The type scale generates CSS custom properties `--step--2` through `--step-6` that smoothly interpolate between a 1.125 ratio at 320px and a 1.2 ratio at 1168px. The space scale generates `--space-3xs` through `--space-3xl` plus custom pair sizes like `--space-s-l` (which interpolates from the small value at minimum viewport to the large value at maximum). This single configuration produces dozens of design tokens that keep the entire site proportionally harmonious across all screen sizes.

## 9. Client-Side Scripts

The site ships minimal JavaScript — only what's needed for interactive features. Each script is a small, focused module.

### search.js — full-text search with Pagefind

```bash
cat src/scripts/search.js
```

```output
/**
 * Utility: Debounce
 * https://github.com/antonmedv/textarea/blob/7ab14e5df775a4f5e2d53465c1842889c16f91e4/index.html#L121C3-L127C4
 */
const debounce = (fn, ms) => {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), ms);
	};
};

class Search {
	constructor() {
		this.searchResults = null;
		this.searchResultsList = null;
		this.searchResultsCount = null;
		this.pagefind = null;

		this.debouncedSearch = debounce(this.performSearch, 300);
	}

	clearResults() {
		this.searchResultsCount.innerHTML = 'Results';
		this.searchResultsList.innerHTML = '';
	}

	escapeHTML(str) {
		if (!str) return '';
		return str.replace(
			/[&<>"']/g,
			(m) =>
				({
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
				})[m],
		);
	}

	createResultHTML(result) {
		// console.log(result);
		const isNote = result.filters.collection[0] === 'notes';
		const pubDate = new Date(result.meta.date);
		const dateLocaleString = new Intl.DateTimeFormat('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Asia/Kolkata',
		}).format(pubDate);

		const title = result.meta.title
			? this.escapeHTML(result.meta.title)
			: this.escapeHTML(result.url);
		const safeExcerpt = result.excerpt
			.replace(/</g, '&lt;')
			.replace(/&lt;mark>/g, '<mark>')
			.replace(/&lt;\/mark>/g, '</mark>');

		return `
			<li
				class="entry-item pb-space-m"
				data-collection=${result.filters.collection[0]}
			>
        <article class="stack">
					<h3 class="heading-2">
	       		${
							!isNote
								? `
							<a href="${this.escapeHTML(result.url)}">${title}</a>
							`
								: `
							<a href="${this.escapeHTML(result.url)}">
							  Note - <span class="visually-hidden">Posted on</span>
							  <time datetime="${this.escapeHTML(result.meta.date)}">
							    ${dateLocaleString}
							  </time>
							</a>
	         `
						}
					</h3>
          <p class="search-result-excerpt">
            ${result.locations[0] > 35 ? `…` : ''}
            ${safeExcerpt}
            ${result.word_count > result.excerpt.split(' ').length ? `…` : ''}
          </p>
          <footer class="cluster text-step--1">
          	<a
							class="text-box-trim"
							href="${this.escapeHTML(result.url)}"
							rel="bookmark"
						>
		          <span class="pub-date text-box-trim">
		        		<span class="visually-hidden">Posted on</span>
								<time datetime="${this.escapeHTML(result.meta.date)}">
									${dateLocaleString}
								</time>
		          </span>
						</a>
          </footer>
        </article>
      </li>
    `;
	}

	/**
	 * Updates the UI text.
	 * Added a 'isLoading' parameter to handle the "Searching..." state.
	 */
	updateUI(count, query, isLoading = false) {
		let statusText = 'Results';
		let titleText = 'Search';

		if (isLoading) {
			statusText = `Searching for '${query}'...`;
		} else if (query && query.length > 1) {
			if (count > 0) {
				const plural = count !== 1 ? 's' : '';
				statusText = `${count} result${plural} for '${query}'`;
			} else {
				statusText = `No matches found for '${query}'`;
			}
			titleText = `${statusText} - Search`;
		}

		this.searchResultsCount.innerHTML = statusText;
		document.title = `${titleText} | Arpit's Blog`;
	}

	async getLibrary() {
		if (!this.pagefind) {
			try {
				this.pagefind = await import('/pagefind/pagefind.js');
				await this.pagefind.options({ excerptLength: 35 });
			} catch (error) {
				console.error('Error loading Pagefind:', error);
			}
		}
		return this.pagefind;
	}

	async performSearch(value) {
		if (value.length > 1) {
			// 1. Show the "Searching..." state immediately
			this.updateUI(0, value, true);
			this.searchResults.classList.remove('hidden');

			const pagefind = await this.getLibrary();
			if (!pagefind) return;

			const search = await pagefind.search(value);

			// If user cleared the input while we were waiting for Pagefind, abort
			if (!this.searchResultsCount.innerHTML.includes('Searching')) return;

			const results = await Promise.all(search.results.map((r) => r.data()));

			this.searchResultsList.innerHTML = results
				.map((result) => this.createResultHTML(result))
				.join('');

			// 2. Update with the actual results
			this.updateUI(results.length, value, false);
			this.searchResultsList.classList.toggle(
				'search-results-notfound',
				results.length === 0,
			);
		} else {
			this.clearResults();
			this.searchResults.classList.add('hidden');
			this.updateUI(0, '');
		}
	}

	hydrate() {
		const form = document.getElementById('search-form');
		const text = document.getElementById('search-term');
		const clearButton = document.querySelector('.clear-btn');

		this.searchResults = document.getElementById('search-results');
		this.searchResultsList = document.getElementById('search-results-list');
		this.searchResultsCount = document.getElementById('search-results-count');

		if (form) form.addEventListener('submit', (e) => e.preventDefault());

		if (text) {
			text.addEventListener('input', (event) => {
				const value = event.target.value;
				this.debouncedSearch(value);

				const url = new URL(window.location);
				if (value) url.searchParams.set('q', value);
				else url.searchParams.delete('q');
				window.history.replaceState({}, '', url);
			});

			const params = new URLSearchParams(window.location.search);
			const initialQuery = params.get('q');
			if (initialQuery) {
				text.value = initialQuery;
				this.performSearch(initialQuery);
			}
		}

		if (clearButton) {
			clearButton.addEventListener('click', () => {
				if (text) {
					text.value = '';
					text.dispatchEvent(new Event('input', { bubbles: true }));
					text.focus();
				}
			});
		}
	}
}

const search = new Search();
search.hydrate();
```

The search system:

1. **Lazy-loads Pagefind** — the search library is only imported when the user actually types something, keeping the initial bundle at zero cost.
2. **Debounced input** — waits 300ms after the user stops typing before searching, preventing excessive API calls.
3. **URL state sync** — the search query is reflected in `?q=` URL parameter via `history.replaceState`, so searches are bookmarkable and shareable.
4. **Initial query** — on page load, checks for a `?q=` parameter and runs the search immediately.
5. **XSS protection** — all result data is escaped via `escapeHTML()`, then Pagefind's `<mark>` tags are carefully restored.
6. **Collection-aware rendering** — notes (which have no title) are rendered differently from articles/links, matching the same pattern used in server-rendered lists.

### book-filters.js — filtering with View Transitions

```bash
cat src/scripts/book-filters.js
```

```output
const fieldset = document.querySelector('fieldset');
const inputs = fieldset.querySelectorAll('input');
const books = Array.from(document.querySelectorAll('.book-list li'));
let bookResultsCount = document.getElementById('books-results-count');

function applyFilter(value) {
	books.forEach((item) => {
		const matches = value === 'all' || item.dataset.tags.includes(value);
		item.toggleAttribute('hidden', !matches);
	});
}

function updateCounts() {
	const count = books.filter((book) => !book.hasAttribute('hidden')).length;
	bookResultsCount.textContent = `${count} ${count === 1 ? 'book' : 'books'}`;
}

fieldset.removeAttribute('disabled');

inputs.forEach((input) => {
	input.addEventListener('change', (e) => {
		const value = e.target.value;

		if (!document.startViewTransition) {
			applyFilter(value);
			updateCounts();
			return;
		}

		document.startViewTransition(() => {
			applyFilter(value);
			updateCounts();
		});
	});
});
```

This is a textbook example of progressive enhancement:

1. **The fieldset starts disabled** in HTML (set in `BookGallery.astro`). If JavaScript fails to load, users see all books with no broken filters.
2. **JavaScript enables it** with `fieldset.removeAttribute("disabled")`.
3. **Filtering** uses the `hidden` attribute — simple, semantic, and CSS-free.
4. **View Transitions** — if the browser supports `document.startViewTransition`, filtering wraps in a transition for a smooth animated effect. If not, filtering just happens instantly. No polyfill, no fallback complexity.
5. **Live count** — an `aria-live="polite"` heading (set in the HTML) announces the filtered count to screen readers.

### copy-to-clipboard.js — a custom web component

```bash
cat src/scripts/copy-to-clipboard.js
```

```output
// https://gomakethings.com/how-to-build-a-copy-to-clipboard-html-web-component/
customElements.define(
	"copy-to-clipboard",
	class extends HTMLElement {
		constructor() {
			super();

			this.btn = this.querySelector("button");
			this.text = this.getAttribute("text");

			// Get the messages
			this.original = this.btn.innerHTML;
			this.statusMsg = this.getAttribute("status-msg") ?? "Copied to Clipboard";
			this.copiedBtnLabel = this.getAttribute("copied-btn-label") ?? "Copied!";

			// If there's no text to copy, bail
			if (!this.text) return;

			// Listen for clicks
			this.btn.addEventListener("click", this);

			// Add an alert
			this.notify = document.createElement("div");
			this.notify.setAttribute("role", "status");
			this.notify.className = "visually-hidden";
			this.append(this.notify);
		}

		/**
		 * Handle events on the Web Component
		 * @param  {Event} event The event object
		 */
		handleEvent() {
			this.copyToClipboard();
		}

		async copyToClipboard() {
			try {
				// Copy the text
				await navigator.clipboard.writeText(this.text);

				// Update the button and status text
				this.btn.innerHTML = this.copiedBtnLabel;
				this.notify.textContent = this.statusMsg;

				// Reset after 5 seconds
				setTimeout(() => {
					this.btn.innerHTML = this.original;
					this.notify.textContent = "";
				}, 5000);
			} catch (error) {
				console.warn("Unable to copy.", error);
			}
		}
	},
);
```

This is an HTML Web Component — it wraps existing server-rendered HTML (`<button>`) rather than replacing it with a shadow DOM. Key accessibility features:

- A `role="status"` live region announces "Copied to Clipboard" to screen readers.
- The button text changes to "Copied!" for visual confirmation, then resets after 5 seconds.
- If there's no `text` attribute, the component silently does nothing (graceful failure).

### back-link.js and mastodon-share.js

```bash
cat src/scripts/back-link.js
```

```output
class BackLink extends HTMLElement {
	connectedCallback() {
		// Find the inner <a>
		const link = this.querySelector("a");
		if (!link) return; // fail gracefully if none

		link.addEventListener("click", (e) => {
			const ref = document.referrer;
			if (ref && new URL(ref).origin === location.origin) {
				e.preventDefault();
				history.back();
			} else {
				location.href = "/";
			}
		});
	}
}
customElements.define("back-link", BackLink);
```

```bash
cat src/scripts/mastodon-share.js
```

```output
// I got the key, I got the secret…
let key = 'mastodon-instance';
let instance = localStorage.getItem(key);

// get the link from the DOM
const button = document.querySelector('.mastodon-share');

// refresh the link with the instance name
const refreshlink = (instance) => {
	button.href = `https://${instance}/share?text=${encodeURIComponent(document.title)}%0A${encodeURIComponent(location.href)}`;
};

// got it? Let's go!
if (button) {
	// labels and texts from the link
	let prompt = button.dataset.prompt || 'Please tell me your Mastodon instance';
	let editlabel = button.dataset.editlabel || 'Edit your Mastodon instance';
	let edittext = button.dataset.edittext || '✏️';

	// Ask the user for the instance name and set it…
	const setinstance = (_) => {
		instance = window.prompt(prompt, instance);
		if (instance) {
			localStorage.setItem(key, instance);
			createEditButton();
			refreshlink(instance);
			button.click();
		}
	};

	// create and insert the edit link
	const createEditButton = (_) => {
		if (document.querySelector('button.mastodon-edit')) return;
		let editlink = document.createElement('button');
		editlink.innerText = edittext;
		editlink.classList.add('mastodon-edit', 'text-box-trim');
		editlink.title = editlabel;
		editlink.ariaLabel = editlabel;
		editlink.addEventListener('click', (e) => {
			e.preventDefault();
			localStorage.removeItem(key);
			setinstance();
		});
		button.insertAdjacentElement('afterend', editlink);
	};

	// if there is  a value in localstorage, create the edit link
	if (localStorage.getItem(key)) {
		createEditButton();
	}

	// When a user clicks the link
	button.addEventListener('click', (e) => {
		// If the user has already entered their instance
		// and it is in localstorage write out the link href
		// with the instance and the current page title and URL
		if (localStorage.getItem(key)) {
			refreshlink(localStorage.getItem(key));
			// otherwise, prompt the user for their instance and save it to localstorage
		} else {
			e.preventDefault();
			setinstance();
		}
	});
}
```

Two more web components complete the client-side JavaScript:

**back-link.js** — Another HTML Web Component. When clicked, it checks if the referrer is from the same origin. If so, it uses `history.back()` for a seamless browser-back experience. If the user arrived from an external site (or directly), it navigates to the homepage instead.

**mastodon-share.js** — Since Mastodon is federated (many instances, each with its own share URL), the script prompts the user for their instance name on first use and stores it in `localStorage`. On subsequent shares, it builds the share URL automatically. An edit button appears once an instance is saved, letting users change it.

Together, the five scripts total well under 10KB. The site's JavaScript philosophy is clear: **enhance the HTML that already works, don't replace it**.

## Summary — The Data Flow

To tie it all together, here is the complete path from a Markdown file to a rendered page:

1. **Author writes** `src/data/notes/cascade/index.md` with YAML frontmatter.
2. **Astro's content loader** picks it up via the glob pattern in `content.config.ts`.
3. **Zod validates** the frontmatter, transforming `pubDate` into a proper Date object.
4. **`loadAndFormatCollection("notes")`** filters drafts, renders Markdown to a `Content` component via `render()`, computes `relativeURL` (`2026/03/cascade/`) and `absoluteURL` (`/notes/2026/03/cascade/`).
5. **`getStaticPaths()`** in `notes/[...slug].astro` maps each enhanced entry to a route.
6. **`EntryPage` layout** wraps the content in `BaseLayout`, renders the collection-aware heading, content, dates, tags, and actions.
7. **`BaseHead`** generates all meta tags, loads fonts, links stylesheets and RSS feeds.
8. **CSS Cascade Layers** style everything using composition primitives, block styles, utilities, and page-level exceptions.
9. **Pagefind** indexes the `data-pagefind-body` content for the search page.
10. **HTML minifier** compresses the output.
11. **The browser** receives a fast, fully-static HTML page. The five small scripts progressively enhance search, book filtering, clipboard copying, back navigation, and Mastodon sharing.
