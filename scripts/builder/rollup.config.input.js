const path = require("path");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");

const nodeResolve = require("@rollup/plugin-node-resolve");
const { eslintBundle } = require("rollup-plugin-eslint-bundle");
const sucrase = require("@rollup/plugin-sucrase");
const json = require("@rollup/plugin-json");

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

	aliasesObj.entries["@config"] = path.resolve(inputPath, 'config.json');

	return {
		input: path.resolve(inputPath, 'index'),
		external: "electron",
		treeshake: "smallest",
		plugins: [
			nodeResolve({ extensions: [".json", ".js", ".jsx", ".css"] }),
			alias(aliasesObj),
			componentsAutoLoader(),
			modulesAutoLoader(),
			json({
				namedExports:false,
				preferConst:true
			}),
			css(),
			eslint(),
			sucrase(sucraseConfig),
			cleanup(cleanupConfig),
			eslintBundle(eslintBundleConfig)
		]
	};
}