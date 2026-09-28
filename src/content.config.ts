import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { rssSchema } from '@astrojs/rss';
/* https://github.com/withastro/astro/blob/main/packages/astro-rss/src/schema.ts */

// Quoted, with seconds and an offset: '2025-02-05T09:00:00+05:30'.
// Output is a Date because Astro's content cache and @astrojs/rss need one.
const timestamp = z.iso
	.datetime({
		offset: true,
		precision: 0,
		error: "Use a quoted timestamp like '2025-02-05T09:00:00+05:30'",
	})
	.pipe(z.coerce.date());

const baseCollectionFields = {
	pubDate: timestamp,
	tags: z.array(z.string()),
	draft: z.boolean().optional(),
};

const notes = defineCollection({
	loader: glob({ base: './src/data/notes', pattern: '**/*.{md,mdx}' }),
	schema: rssSchema.extend(baseCollectionFields).transform((entry) => ({
		...entry,
		categories: entry.tags ?? [],
	})),
});

const articles = defineCollection({
	loader: glob({ base: './src/data/articles', pattern: '**/*.{md,mdx}' }),
	schema: rssSchema
		.extend({
			...baseCollectionFields,
			title: z.string(),
			updatedDate: timestamp.optional(),
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

const links = defineCollection({
	loader: glob({ base: './src/data/links', pattern: '**/*.{md,mdx}' }),
	schema: rssSchema
		.extend({
			...baseCollectionFields,
			title: z.string(),
			link: z.string(),
			via: z.object({ url: z.url(), label: z.string() }).optional(),
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

const books = defineCollection({
	loader: file('src/data/books.json'),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		subtitle: z.string().optional(),
		author: z.string(),
		cover: z.string(),
		tags: z.array(z.string()),
		status: z.enum(['unread', 'read', 'reading']).default('unread'),
		dominantColor: z.string(),
	}),
});

export const collections = { notes, articles, links, books };
