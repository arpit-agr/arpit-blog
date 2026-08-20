// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import htmlMinifierNext from 'astro-html-minifier-next';

// https://astro.build/config
export default defineConfig({
	site: 'https://arpit.blog',
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Figtree',
			cssVariable: '--font-sans-serif',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/fonts/Figtree-VariableFont_wght-subset.woff2'],
						weight: '300 900',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
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
			rolldownOptions: {
				external: ['/pagefind/pagefind.js'],
			},
		},
	},
	trailingSlash: 'always',
});
