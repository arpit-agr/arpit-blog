// https://blog.damato.design/posts/astro-rss-mdx/
import rss from "@astrojs/rss";
import { loadAllEntries } from "@utils/loadAllEntries";
import { render } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

export async function GET(context) {
	let baseUrl = context.site.origin;

	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const allEntries = await loadAllEntries();

	const items = [];

	for (const entry of allEntries) {
		const { Content } = await render(entry);
		const html = await container.renderToString(Content);

		// Absolutify image + link paths
		const contentHtml = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split("=")[0]}="${baseUrl}${path}"`,
		);

		if (entry.collection === "notes") {
			items.push({
				...entry.data,
				link: entry.absoluteURL,
				description: contentHtml,
			});
		} else if (entry.collection === "links") {
			items.push({
				...entry.data,
				content: contentHtml,
			});
		} else {
			items.push({
				...entry.data,
				link: entry.absoluteURL,
				content: contentHtml,
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
