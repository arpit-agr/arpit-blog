import rss from "@astrojs/rss";
import { loadAndFormatCollection } from "@utils/collection";
import { renderRSSItems } from "@utils/rss";
import { LINKS_TITLE, LINKS_DESCRIPTION } from "src/consts";

export async function GET(context) {
	const baseUrl = context.site.origin;
	const entries = await loadAndFormatCollection("links");
	const items = await renderRSSItems(entries, baseUrl);

	return rss({
		title: LINKS_TITLE,
		description: LINKS_DESCRIPTION,
		site: baseUrl,
		items,
	});
}
