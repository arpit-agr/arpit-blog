const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		require("postcss-utopia")({
			minWidth: 320, // 20rem
			maxWidth: 896, // 56rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
