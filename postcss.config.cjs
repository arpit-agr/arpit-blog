const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
	plugins: [
		require('postcss-utopia')({
			minWidth: 320, // 20rem
			maxWidth: 1168, // 73rem
		}),
		postcssPresetEnv({
			features: {},
		}),
	],
};
