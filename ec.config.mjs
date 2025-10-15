import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
	cascadeLayer: "blocks",
	themes: ["min-light", "min-dark"],
	styleOverrides: {
		borderColor: "var(--color-border)",
		borderRadius: "var(--code-border-radius)",
		borderWidth: "var(--border-thickness-s)",
		codeFontFamily: "var(--font-mono)",
		codeFontSize: "var(--code-font-size)",
		codeFontWeight: "var(--code-font-weight)",
		codeLineHeight: "var(--leading-relaxed)",
		codePaddingBlock: "var(--code-padding-block)",
		codePaddingInline: "var(--code-padding-inline)",
		focusBorder: "var(--color-focus)",
		uiFontFamily: "var(--font-sans-serif)",
		uiFontSize: "var(--step--1)",
		uiLineHeight: "var(--leading-relaxed)",
		uiPaddingBlock: "var(--space-4xs)",
		frames: {
			editorActiveTabBackground: "var(--color-bg-secondary)",
			editorBackground: "var(--color-bg-primary)",
			editorTabBarBackground: "var(--color-bg-secondary)",
			editorTabBarBorderColor: "var(--color-border)",
			editorActiveTabIndicatorBottomColor: "var(--color-bg-secondary)",
			frameBoxShadowCssValue: "none",
		},
		textMarkers: {
			inlineMarkerPadding: "0.25ch",
			inlineMarkerBorderWidth: "0",
		},
	},
	useStyleReset: false,
});
