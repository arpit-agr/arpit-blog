import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
	cascadeLayer: "blocks",
	themes: ["light-plus"],
	styleOverrides: {
		borderColor: "var(--color-border-light)",
		borderRadius: "var(--code-border-radius)",
		borderWidth: "var(--border-width-normal)",
		codeFontFamily: "var(--font-mono)",
		codeFontSize: "var(--code-font-size)",
		codeLineHeight: "var(--leading-relaxed)",
		codePaddingBlock: "var(--code-padding-block)",
		codePaddingInline: "var(--code-padding-inline)",
		uiFontFamily: "var(--font-sans-serif)",
		uiFontSize: "var(--step--1)",
		uiLineHeight: "var(--leading-normal)",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		textMarkers: {
			inlineMarkerPadding: "0.25ch",
			inlineMarkerBorderWidth: "0",
		},
	},
	useStyleReset: false,
});
