const path = require("path");
const buildMeta = require('./helpers/buildMeta.js');

const json = require("@rollup/plugin-json");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");
const sucrase = require("@rollup/plugin-sucrase");
const nodeResolve = require("@rollup/plugin-node-resolve");
const { eslintBundle } = require("rollup-plugin-eslint-bundle");

const css = require("./rollup-plugins/css.js");
const eslint = require("./rollup-plugins/eslint.js");
const beautify = require("./rollup-plugins/beautify.js");
const modulesAutoLoader = require("./rollup-plugins/modules-auto-loader.js");
const componentsAutoLoader = require("./rollup-plugins/components-auto-loader.js");

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

const changelog = (pluginConfig) => {
	let first = true;
	return !pluginConfig.changelog ? {} : {
		name: "Changelog",
		transform(code) {
			if (first) {
				first = false;
				if (pluginConfig.changelog) {
					code += `import shouldChangelog from "@Utils/Changelog";shouldChangelog()?.();`;
					return code;
				}
			}
		}
	};
}

const aliasesObj = {
	entries: {
		"@Api": path.resolve('common', 'Api'),
		"@Utils": path.resolve('common', 'Utils'),
		"@Webpack": path.resolve('common', 'Webpack'),
	}
};

module.exports = function getConfig(inputPath, outputPath, pluginConfig) {

	return {
		input: {
			input: path.resolve(inputPath, 'index'),
			external: "electron",
			treeshake: "smallest",
			plugins: [
				nodeResolve({ extensions: [".json", ".js", ".jsx", ".css"] }),
				alias(aliasesObj),
				componentsAutoLoader(),
				modulesAutoLoader(),
				json({
					namedExports: false,
					preferConst: true
				}),
				changelog(pluginConfig),
				css(),
				eslint(),
				sucrase(sucraseConfig),
				cleanup(cleanupConfig),
				eslintBundle(eslintBundleConfig)
			]
		},
		output: {
			file: outputPath,
			format: 'cjs',
			generatedCode: {
				constBindings: true,
				objectShorthand: true
			},
			strict: false,
			intro: `${buildMeta(pluginConfig)}\nconst config = ${JSON.stringify(pluginConfig, null, 4)}`,
			plugins: [
				beautify()
			]
		}
	}
}