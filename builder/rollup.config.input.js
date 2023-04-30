const path = require("path");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");

const nodeResolve = require("@rollup/plugin-node-resolve");
const { eslintBundle } = require("rollup-plugin-eslint-bundle");
const sucrase = require("@rollup/plugin-sucrase");

const eslint = require("./rollup-plugins/eslint.js");
const css = require("./rollup-plugins/css.js");
const componentsAutoLoader = require("./rollup-plugins/components-auto-loader.js");
const modulesAutoLoader = require("./rollup-plugins/modules-auto-loader.js");

const aliasesObj = {
	entries: {
		"@Api": path.resolve('common', 'Api'),
		"@Utils": path.resolve('common', 'Utils'),
		"@Webpack": path.resolve('common', 'Webpack'),
	}
};

const sucraseConfig = {
	transforms: ['jsx'],
	production: true,
	disableESTransforms: true,
};

const cleanupConfig = {
	comments: ['some', /\*/],
	maxEmptyLines: 1,
	extensions: [".js", ".jsx", ".css"],
	sourcemap: false
};

const eslintBundleConfig = {
	formatter: 'stylish'
};

module.exports = (inputPath) => {
	return {
		input: inputPath,
		external:"electron",
		treeshake: "smallest",
		plugins: [
			nodeResolve({ extensions: [".js", ".jsx", ".css"] }),
			alias(aliasesObj),
			componentsAutoLoader(),
			modulesAutoLoader(),
			css(),
			eslint(),
			sucrase(sucraseConfig),
			cleanup(cleanupConfig),
			eslintBundle(eslintBundleConfig)
		]
	};
}