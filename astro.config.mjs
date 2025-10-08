// @ts-check
import { defineConfig } from "astro/config";
import markdoc from "@astrojs/markdoc";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
	site: "https://arpit.blog",
	integrations: [markdoc(), expressiveCode()],
	trailingSlash: "always",
});
