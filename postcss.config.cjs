const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		require("postcss-utopia")({
			minWidth: 320, // 20rem
			maxWidth: 1408, // 88rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
