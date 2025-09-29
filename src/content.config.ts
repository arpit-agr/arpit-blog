import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";
/* https://github.com/withastro/astro/blob/main/packages/astro-rss/src/schema.ts */

const baseCollectionFields = {
	pubDate: z
		.union([z.string(), z.number(), z.date()])
		.transform((value) => new Date(value))
		.refine((value) => !isNaN(value.getTime())),
	updatedDate: z
		.union([z.string(), z.number(), z.date()])
		.transform((value) => new Date(value))
		.refine((value) => !isNaN(value.getTime()))
		.optional(),
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
		})
		.transform((entry) => ({
			...entry,
			categories: entry.tags ?? [],
		})),
});

export const collections = { notes, articles };
