const path = require('path');
const buildMeta = require('./helpers/buildMeta.js');
const beautify = require("./rollup-plugins/beautify.js");

module.exports = (outputPath, config) => {
	return {
		file: outputPath,
		format: 'cjs',
		generatedCode: {
			constBindings: true,
			objectShorthand: true
		},
		strict: false,
		intro: `${buildMeta(config)}\nconst config = ${JSON.stringify(config,null,4)}`,
		plugins: [
			beautify(),
		]
	};
}