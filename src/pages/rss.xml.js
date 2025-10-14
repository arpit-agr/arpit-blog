import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";

const images = import.meta.glob("/src/data/**/*.{png,jpg,jpeg,webp,gif,svg}", {
	eager: true,
	query: "?url",
	import: "default",
});

export async function GET(context) {
	let baseUrl = context.site?.href || "https://arpit.blog";
	if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

	const renderers = await loadRenderers([]);
	const container = await AstroContainer.create({ renderers });

	const allNotes = await getCollection("notes", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const allArticles = await getCollection("articles", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const allLinks = await getCollection("links", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);

	const allEntries = [...allNotes, ...allArticles, ...allLinks];
	allEntries.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const items = [];

	for (const entry of allEntries) {
		const { Content } = await render(entry);
		const html = await container.renderToString(Content);

		// Absolutify image + link paths
		const absolutified = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split("=")[0]}="${baseUrl}${path}"`,
		);

		if (entry.collection === "notes") {
			items.push({
				...entry.data,
				link: `/notes/${entry.id}/`,
				description: absolutified,
			});
		} else if (entry.collection === "links") {
			items.push({
				...entry.data,
				content: absolutified,
			});
		} else {
			items.push({
				...entry.data,
				link: `/articles/${entry.id}/`,
				content: absolutified,
			});
		}
	}

	return rss({
		title: `${SITE_TITLE}`,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
