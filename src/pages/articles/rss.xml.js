import rss from "@astrojs/rss";
import { loadAndFormatCollection } from "@utils/collection";
import { renderRSSItems } from "@utils/rss";
import { ARTICLES_TITLE, ARTICLES_DESCRIPTION } from "src/consts";

export async function GET(context) {
	const baseUrl = context.site.origin;
	const entries = await loadAndFormatCollection("articles");
	const items = await renderRSSItems(entries, baseUrl);

	return rss({
		title: ARTICLES_TITLE,
		description: ARTICLES_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
