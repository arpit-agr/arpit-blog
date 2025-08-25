import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
	loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdoc}" }),
	schema: z.object({
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ base: "./src/data/articles", pattern: "**/*.{md,mdoc}" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

export const collections = { notes, articles };
