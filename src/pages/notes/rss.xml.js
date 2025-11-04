// https://blog.damato.design/posts/astro-rss-mdx/
import rss from "@astrojs/rss";
import { loadAndFormatCollection } from "@utils/collection";
import { render } from "astro:content";
import { NOTES_TITLE, NOTES_DESCRIPTION } from "src/consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

export async function GET(context) {
	let baseUrl = context.site.origin;

	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const allEntries = await loadAndFormatCollection("notes");

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
			link: entry.absoluteURL,
			description: absolutified,
		});
	}

	return rss({
		title: NOTES_TITLE,
		description: NOTES_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
