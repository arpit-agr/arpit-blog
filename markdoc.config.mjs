// @ts-check
import { defineMarkdocConfig, nodes, component } from "@astrojs/markdoc/config";
import shiki from "@astrojs/markdoc/shiki";

export default defineMarkdocConfig({
	nodes: {
		document: {
			...nodes.document, // Apply defaults for other options
			render: undefined, // default 'article'
		},
		heading: {
			...nodes.heading, // Preserve default anchor link generation
			render: component("@components/Heading.astro"),
		},
		fence: {
			attributes: {
				...nodes.fence.attributes,
				title: { type: String, render: "title" },
				frame: {
					type: String,
					render: "frame",
					required: false,
					default: "auto",
					matches: ["auto", "code", "terminal", "none"],
				},
				meta: { type: String, required: false },
			},
			render: component("@components/Code.astro"),
		},
	},
	tags: {
		"idiomatic-text": {
			/* The i element represents a span of text in an alternate voice or mood, or otherwise offset from the normal prose in a manner indicating a different quality of text, such as a taxonomic designation, a technical term, an idiomatic phrase from another language, transliteration, a thought, or a ship name in Western texts. */
			render: "i",
			attributes: {
				lang: { type: String },
				class: { type: String },
				style: { type: String },
			},
		},
	},
	extends: [
		shiki({
			// Choose from Shiki's built-in themes (or add your own)
			// Default: 'github-dark'
			// https://shiki.style/themes
			theme: "light-plus",
			// Enable word wrap to prevent horizontal scrolling
			// Default: false
			wrap: false,
			// Pass custom languages
			// Note: Shiki has countless langs built-in, including `.astro`!
			// https://shiki.style/languages
			langs: [],
		}),
	],
});
