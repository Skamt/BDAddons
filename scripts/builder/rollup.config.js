const path = require("path");

const json = require("@rollup/plugin-json");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");
const sucrase = require("@rollup/plugin-sucrase");
const nodeResolve = require("@rollup/plugin-node-resolve");
const stripCode = require("rollup-plugin-strip-code");
const { eslintBundle } = require("rollup-plugin-eslint-bundle");

const css = require("./rollup-plugins/css.js");
const beautify = require("./rollup-plugins/beautify.js");
const modulesAutoLoader = require("./rollup-plugins/modules-auto-loader.js");
const componentsAutoLoader = require("./rollup-plugins/components-auto-loader.js");
const meta = require("./rollup-plugins/meta.js");

const sucraseConfig = {
	transforms: ["jsx"],
	production: true,
	disableESTransforms: true
};

const cleanupConfig = {
	comments: ["some", /\*/],
	maxEmptyLines: 1,
	extensions: [".js", ".jsx", ".css"],
	sourcemap: false
};

const eslintBundleConfig = {
	formatter: "stylish"
};

const stripCodeConfig = {
	start_comment: "DEBUG",
	end_comment: "DEBUG"
};

const changelog = () => {
	let first = true;
	return {
		name: "Changelog",
		transform(code) {
			if (first) {
				first = false;
				return `import shouldChangelog from "@Utils/Changelog";shouldChangelog()?.();${code}`;
			}
		}
	};
};

const aliasesObj = {
	entries: {
		"@Api": path.resolve("common", "Api"),
		"@Utils": path.resolve("common", "Utils"),
		"@Webpack": path.resolve("common", "Webpack")
	}
};

module.exports = function getConfig(inputPath, releasePath, devPath, config) {
	const inputConfig = {
		input: path.resolve(inputPath, "index"),
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
			config.changelog ? changelog() : {},
			css(),
			sucrase(sucraseConfig),
			cleanup(cleanupConfig),
			eslintBundle(eslintBundleConfig),
			meta(config)
		]
	};

	const outputConfig = {
		format: "cjs",
		generatedCode: {
			constBindings: true,
			objectShorthand: true
		},
		strict: false,
		plugins: [beautify()]
	};
	return {
		release: {
			input: {
				...inputConfig,
				plugins: [...inputConfig.plugins, stripCode(stripCodeConfig)]
			},
			output: {
				file: releasePath,
				...outputConfig
			}
		},
		dev: {
			input: {
				...inputConfig
			},
			output: {
				file: devPath,
				...outputConfig
			}
		}
	};
};
