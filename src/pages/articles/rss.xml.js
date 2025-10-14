import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";

// Adjust this glob to match where your article images live.
const images = import.meta.glob(
	"/src/content/articles/**/*.{png,jpg,jpeg,webp,gif,svg}",
	{
		eager: true,
		as: "url",
	},
);

export async function GET(context) {
	let baseUrl = context.site?.href || "https://arpit.blog";
	if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

	// Pass an empty array to avoid the `renderers.map is not a function` crash.
	const renderers = await loadRenderers([]); // <- important: do not pass undefined
	const container = await AstroContainer.create({ renderers });

	const allArticles = await getCollection("articles", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);

	const allEntries = allArticles.sort(
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

		items.push({
			...entry.data,
			link: `/articles/${entry.id}/`,
			content: absolutified,
		});
	}

	return rss({
		title: `${SITE_TITLE}: Articles`,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
