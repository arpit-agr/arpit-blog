import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
	cascadeLayer: "blocks",
	themes: ["min-light", "vesper"],
	styleOverrides: {
		borderColor: "var(--color-border-light)",
		borderRadius: "var(--code-border-radius)",
		borderWidth: "var(--border-thickness-s)",
		codeFontFamily: "var(--font-mono)",
		codeFontSize: "var(--code-font-size)",
		codeLineHeight: "var(--leading-relaxed)",
		codePaddingBlock: "var(--code-padding-block)",
		codePaddingInline: "var(--code-padding-inline)",
		focusBorder: "var(--color-focus)",
		uiFontFamily: "var(--font-sans-serif)",
		uiFontSize: "var(--step--1)",
		uiLineHeight: "var(--leading-relaxed)",
		uiPaddingBlock: "var(--space-4xs)",
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
