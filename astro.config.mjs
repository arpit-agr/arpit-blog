// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import htmlMinifierNext from 'astro-html-minifier-next';

// https://astro.build/config
export default defineConfig({
	site: 'https://arpit.blog',
	markdown: {
		shikiConfig: {
			theme: 'css-variables',
			defaultColor: false,
		},
	},
	integrations: [
		mdx(),
		pagefind(),
		htmlMinifierNext({
			caseSensitive: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			continueOnMinifyError: false,
			keepClosingSlash: false,
			preventAttributesEscaping: true,
			removeComments: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
		}),
	],
	vite: {
		build: {
			rollupOptions: {
				// This tells Rollup: "Don't try to find this file, it's external"
				// 'satteri' / '@astrojs/markdown-satteri' are optional peer deps of
				// @astrojs/mdx 6 that we don't use (we're on the default markdown-remark
				// engine). Rollup eagerly follows the dynamic import of the satteri code
				// path and fails to resolve these uninstalled packages, so externalize
				// them — the code path never executes at runtime.
				external: [
					'/pagefind/pagefind.js',
					'satteri',
					'@astrojs/markdown-satteri',
				],
			},
		},
	},
	trailingSlash: 'always',
});
