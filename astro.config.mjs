// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import { pluginLanguageBadge } from 'expressive-code-language-badge';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
// import htmlMinifierNext from 'astro-html-minifier-next';

// https://astro.build/config
export default defineConfig({
	site: 'https://arpit.blog',
	integrations: [
		expressiveCode({
			plugins: [pluginLanguageBadge()],
		}),
		mdx(),
		pagefind(),
		// htmlMinifierNext({
		// 	caseSensitive: true,
		// 	collapseBooleanAttributes: true,
		// 	collapseWhitespace: true,
		// 	continueOnMinifyError: false,
		// 	keepClosingSlash: false,
		// 	preventAttributesEscaping: true,
		// 	removeComments: true,
		// 	removeScriptTypeAttributes: true,
		// 	removeStyleLinkTypeAttributes: true,
		// 	useShortDoctype: true,
		// }),
	],
	vite: {
		build: {
			rollupOptions: {
				// This tells Rollup: "Don't try to find this file, it's external"
				external: ['/pagefind/pagefind.js'],
			},
		},
	},
	trailingSlash: 'always',
});
