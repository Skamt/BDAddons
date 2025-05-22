const path = require("path");

const json = require("@rollup/plugin-json");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");
const re = require("rollup-plugin-re");
const sucrase = require("@rollup/plugin-sucrase");
const nodeResolve = require("@rollup/plugin-node-resolve");
// const postcss = require("rollup-plugin-postcss");
const commonjs = require("@rollup/plugin-commonjs");
const stripCode = require("rollup-plugin-strip-code");
const { eslintBundle } = require("rollup-plugin-eslint-bundle");

const css = require("./rollup-plugins/css.js");
const codeRegions = require("./rollup-plugins/codeRegions.js");
const beautify = require("./rollup-plugins/beautify.js");
const cleanupPureComments = require("./rollup-plugins/cleanupPureComments.js");
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
	maxEmptyLines: 0,
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

const aliasesObj = inputPath => ({
	entries: {
		"@Api": path.resolve("common", "Api"),
		"@Utils": path.resolve("common", "Utils"),
		"@Webpack": path.resolve("common", "Webpack"),
		"@React": path.resolve("common", "React"),
		"@Discord": path.resolve("common", "DiscordModules"),
		"@": path.resolve(inputPath)
	}
});

module.exports = function getConfig(inputPath, releasePath, devPath, config) {
	const inputConfig = {
		input: path.resolve(inputPath, "index"),
		treeshake: {
			preset: "smallest"
		},
		plugins: [
			commonjs(),
			nodeResolve({ extensions: [".json", ".js", ".jsx", ".css"] }),
			alias(aliasesObj(inputPath)),
			re({
				include: "**/common/**",
				patterns: [
					{
						test: "svg(",
						replace: "/*@__PURE__*/ svg("
					},
					{
						test: "path(",
						replace: "/*@__PURE__*/ path("
					},
					{
						test: "getModule(",
						replace: "/*@__PURE__*/ getModule("
					},
					{
						test: /(Filters\..+?\()/gi,
						replace: "/*@__PURE__*/ $1"
					}
				]
			}),
			componentsAutoLoader(),
			modulesAutoLoader(),
			json({
				namedExports: false,
				preferConst: true
			}),
			config.changelog ? changelog() : {},
			// postcss({
			// 	plugins: [require("@tailwindcss/postcss")],
			// 	inject: false,
			// 	minimize: true
			// }),
			css(),
			sucrase(sucraseConfig),
			cleanup(cleanupConfig),
			eslintBundle(eslintBundleConfig),
			meta(config),
			codeRegions()
		]
	};

	const outputConfig = {
		format: "cjs",
		generatedCode: {
			constBindings: true,
			objectShorthand: true
		},
		strict: false,
		plugins: [cleanupPureComments(), beautify()]
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
