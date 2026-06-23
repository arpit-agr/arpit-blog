import type { AnyEntry } from '@appTypes/entries';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { loadRenderers } from 'astro:container';

/**
 * Renders entries to RSS items with absolutified URLs.
 * Maps each entry to the correct RSS fields based on its collection type:
 * - notes: full HTML as `description`, `link` points to the entry page
 * - articles: full HTML as `content`, `link` points to the entry page
 * - links: full HTML as `content`, `link` comes from frontmatter (the external URL)
 */
export async function renderRSSItems(entries: AnyEntry[], baseUrl: string) {
	const renderers = await loadRenderers([getContainerRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const items = [];

	for (const entry of entries) {
		const { Content } = await render(entry);
		const html = await container.renderToString(Content);

		const contentHtml = html.replace(
			/(?:src|href)="(\/[^"]+)"/g,
			(match, path) => `${match.split('=')[0]}="${baseUrl}${path}"`,
		);

		if (entry.collection === 'notes') {
			items.push({
				...entry.data,
				link: entry.absoluteURL,
				description: contentHtml,
			});
		} else if (entry.collection === 'links') {
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

	return items;
}
