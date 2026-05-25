import rss from '@astrojs/rss';
import { loadAllEntries } from '@utils/loadAllEntries';
import { renderRSSItems } from '@utils/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from 'src/consts';

export async function GET(context) {
	const baseUrl = context.site.origin;
	const entries = await loadAllEntries();
	const items = await renderRSSItems(entries, baseUrl);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
