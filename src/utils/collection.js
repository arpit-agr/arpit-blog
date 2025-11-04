// https://www.rick.me.uk/posts/2024/03/custom-url-formats-in-astro/

import { getCollection } from "astro:content";

export async function loadAndFormatCollection(name, withDate = true) {
	const allEntries = await getCollection(name);
	const sortedEntries = allEntries.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	const pubEntries = sortedEntries.filter((entry) =>
		import.meta.env.PROD ? entry.data.draft !== true : true,
	);

	pubEntries.forEach((entry) => {
		if (withDate) {
			const date = new Date(entry.data.pubDate);
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const monthZerofilled = (month < 10 ? "0" : "") + month;

			entry.relativeURL = `${year}/${monthZerofilled}/${entry.id}/`;
		} else {
			entry.relativeURL = `${entry.id}/`;
		}

		entry.absoluteURL = `/${name}/${entry.relativeURL}`;
	});

	return pubEntries;
}
