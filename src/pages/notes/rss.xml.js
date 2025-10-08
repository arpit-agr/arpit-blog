import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@src/consts";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import { transform, walk } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";

const parser = new MarkdownIt({ html: true });

export async function GET(context) {
	let baseUrl = context.site?.href || "https://arpit.blog";
	if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

	const allNotes = await getCollection("notes", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const allEntries = allNotes.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const items = [];
	for (const entry of allEntries) {
		// Render markdown → HTML string
		const rawHtml = parser.render(entry.body);

		// Absolutify links + sanitize
		const description = await transform(rawHtml, [
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
			link: `/notes/${entry.id}/`,
			description, // full sanitized HTML content
			...entry.data,
		});
	}

	return rss({
		title: `${SITE_TITLE}: Notes`,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
