const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		require("postcss-utopia")({
			minWidth: 320, // 20rem
			maxWidth: 1328, // 83rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
