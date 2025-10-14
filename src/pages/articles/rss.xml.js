import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";

const images = import.meta.glob(
	"/src/data/articles/**/*.{png,jpg,jpeg,webp,gif,svg}",
	{
		eager: true,
		query: "?url",
		import: "default",
	},
);

export async function GET(context) {
	let baseUrl = context.site?.href || "https://arpit.blog";
	if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

	const renderers = await loadRenderers([]);
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
		let contentHtml = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split("=")[0]}="${baseUrl}${path}"`,
		);

		contentHtml = contentHtml
			.replace(/<h3/g, "<h2")
			.replace(/<\/h3>/g, "<\/h2>")
			.replace(/<h4/g, "<h3")
			.replace(/<\/h4>/g, "<\/h3>")
			.replace(/<h5/g, "<h4")
			.replace(/<\/h5>/g, "<\/h4>");

		items.push({
			...entry.data,
			link: `/articles/${entry.id}/`,
			content: contentHtml,
		});
	}

	return rss({
		title: `${SITE_TITLE}: Articles`,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
