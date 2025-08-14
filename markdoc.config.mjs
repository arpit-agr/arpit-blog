import { defineMarkdocConfig, nodes, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	nodes: {
		document: {
			...nodes.document, // Apply defaults for other options
			render: null, // default 'article'
		},
		heading: {
			...nodes.heading, // Preserve default anchor link generation
			render: component("@components/Heading.astro"),
		},
	},
});
