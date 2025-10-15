// https://blog.damato.design/posts/astro-rss-mdx/
import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { ARTICLES_TITLE, ARTICLES_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

export async function GET(context) {
	let baseUrl = context.site.origin;

	const renderers = await loadRenderers([getMDXRenderer()]);
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
		const contentHtml = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split("=")[0]}="${baseUrl}${path}"`,
		);

		items.push({
			...entry.data,
			link: `/articles/${entry.id}/`,
			content: contentHtml,
		});
	}

	return rss({
		title: ARTICLES_TITLE,
		description: ARTICLES_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
