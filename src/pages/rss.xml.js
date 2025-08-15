import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "@src/consts";
import Markdoc from "@markdoc/markdoc";
import sanitizeHtml from "sanitize-html";

export async function GET(context) {
	const allNotes = await getCollection("notes");
	const allBlogPosts = await getCollection("blog");

	const allEntries = [...allNotes, ...allBlogPosts].sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: await Promise.all(
			allEntries.map(async (post) => {
				// Parse the Markdoc content
				const ast = Markdoc.parse(post.body);

				// Transform with minimal config for clean HTML output
				const content = Markdoc.transform(ast, {
					nodes: {
						document: {
							render: null, // Remove <article> wrapper
						},
					},
				});

				// Render to HTML
				const html = Markdoc.renderers.html(content);

				// Sanitize the HTML
				const sanitizedContent = sanitizeHtml(html, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					allowedAttributes: {
						...sanitizeHtml.defaults.allowedAttributes,
						"*": ["id", "class"], // Allow id and class on all elements
					},
				});

				// Determine correct base path
				const basePath = post.collection === "notes" ? "/notes" : "/blog";

				return {
					...post.data,
					link: `${basePath}/${post.id}/`,
					content: sanitizedContent,
				};
			}),
		),
	});
}
