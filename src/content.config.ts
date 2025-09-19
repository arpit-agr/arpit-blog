import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* https://github.com/withastro/astro/blob/main/packages/astro-rss/src/schema.ts */
import { rssSchema } from "@astrojs/rss";

const notes = defineCollection({
	loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdoc}" }),
	schema: rssSchema.extend({
		pubDate: z
			.union([z.string(), z.number(), z.date()])
			.transform((value) => new Date(value))
			.refine((value) => !isNaN(value.getTime())),
		updatedDate: z
			.union([z.string(), z.number(), z.date()])
			.transform((value) => new Date(value))
			.refine((value) => !isNaN(value.getTime()))
			.optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ base: "./src/data/articles", pattern: "**/*.{md,mdoc}" }),
	schema: rssSchema.extend({
		title: z.string(),
		pubDate: z
			.union([z.string(), z.number(), z.date()])
			.transform((value) => new Date(value))
			.refine((value) => !isNaN(value.getTime())),
		updatedDate: z
			.union([z.string(), z.number(), z.date()])
			.transform((value) => new Date(value))
			.refine((value) => !isNaN(value.getTime()))
			.optional(),
	}),
});

export const collections = { notes, articles };
