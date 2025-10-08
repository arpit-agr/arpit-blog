import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "@src/consts";
import Markdoc from "@markdoc/markdoc";
import { transform, walk } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";

export async function GET(context) {
	let baseUrl = context.site?.href || "https://arpit.blog";
	if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

	const allArticles = await getCollection("articles", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const allEntries = allArticles.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const items = [];
	for (const entry of allEntries) {
		// Parse + transform Markdoc AST
		const ast = Markdoc.parse(entry.body);
		const transformed = Markdoc.transform(ast, {
			nodes: {
				document: { render: null }, // strip <article>
			},
			tags: {
				"idiomatic-text": {
					render: "i",
					attributes: {
						lang: { type: String },
						class: { type: String },
						style: { type: String },
					},
				},
			},
		});

		// Render to raw HTML string
		const rawHtml = Markdoc.renderers.html(transformed);

		// Absolutify links + sanitize
		const content = await transform(rawHtml, [
			async (node) => {
				await walk(node, (node) => {
					if (node.name === "a" && node.attributes.href?.startsWith("/")) {
						node.attributes.href = baseUrl + node.attributes.href;
					}
					if (node.name === "img" && node.attributes.src?.startsWith("/")) {
						node.attributes.src = baseUrl + node.attributes.src;
					}
				});
				return node;
			},
			sanitize({ dropElements: ["script", "style"] }),
		]);

		items.push({
			...entry.data,
			link: `/articles/${entry.id}/`,
			content,
		});
	}

	return rss({
		title: `${SITE_TITLE}: Articles`,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
