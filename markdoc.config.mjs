// @ts-check
import { defineMarkdocConfig, nodes, component } from "@astrojs/markdoc/config";

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
	},
	tags: {
		"idiomatic-text": {
			render: component("@components/IdiomaticText.astro"),
		},
	},
});
