import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
	loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdoc}" }),
	schema: z.object({
		title: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

const blog = defineCollection({
	loader: glob({ base: "./src/data/blog", pattern: "**/*.{md,mdoc}" }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

export const collections = { notes, blog };
