import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";
/* https://github.com/withastro/astro/blob/main/packages/astro-rss/src/schema.ts */

const baseCollectionFields = {
	pubDate: z
		.union([z.string(), z.number(), z.date()])
		.transform((value) => new Date(value))
		.refine((value) => !isNaN(value.getTime())),
	tags: z.array(z.string()).optional(),
	draft: z.boolean().optional(),
};

const notes = defineCollection({
	loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdoc}" }),
	schema: rssSchema.extend(baseCollectionFields).transform((entry) => ({
		...entry,
		categories: entry.tags ?? [],
	})),
});

const articles = defineCollection({
	loader: glob({ base: "./src/data/articles", pattern: "**/*.{md,mdoc}" }),
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
	loader: glob({ base: "./src/data/links", pattern: "**/*.{md,mdoc}" }),
	schema: rssSchema
		.extend({
			...baseCollectionFields,
			title: z.string(),
			bookmark: z.string(),
			via: z.object({ url: z.string().url(), label: z.string() }).optional(),
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

export const collections = { notes, articles, links };
