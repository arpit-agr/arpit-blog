const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		require("postcss-utopia")({
			minWidth: 320, // 20rem
			maxWidth: 1200, // 75rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
