// @ts-check
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import { pluginLanguageBadge } from "expressive-code-language-badge";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
	site: "https://arpit.blog",
	integrations: [
		expressiveCode({
			plugins: [pluginLanguageBadge()],
		}),
		mdx(),
	],
	trailingSlash: "always",
});
