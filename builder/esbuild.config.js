const globImport = require("esbuild-plugin-import-glob").default;
const componentsAutoLoader = require("./plugins/componentsAutoLoader");
const configPlugin = require("./plugins/config");
const css = require("./plugins/css");
const houseKeeping = require("./plugins/houseKeeping");
const modulesAutoLoader = require("./plugins/modulesAutoLoader");

const jsconfig = pluginRoot => ({
	"compilerOptions": {
		"paths": {
			"@/*": [`${pluginRoot}/*`],
			"@Api": ["./common/Api"],
			"@Webpack": ["./common/Webpack"],
			"@React": ["./common/React"],
			"@Utils": ["./common/Utils"],
			"@Utils/*": ["./common/Utils/*"],
			"@Discord/*": ["./common/DiscordModules/*"]
		}
	}
});

module.exports = ({ watch, config, entryPoint, outputFile, pluginRoot }) => {
	return {
		format: "cjs",
		bundle: true,
		dropLabels: [global.dev ? "" : "DEV"],
		resolveExtensions: [".json", ".js", ".jsx", ".css"],
		tsconfigRaw: jsconfig(pluginRoot),
		loader: {
			".js": "jsx",
			".css": "css"
		},
		alias: {
			"react": "@React",
			"react-dom": "@React"
		},

		external: ["electron"],
		logLevel: !watch ? "silent" : "warning",
		platform: "browser",
		jsx: "transform",
		treeShaking: true,
		target: "chrome128",
		entryPoints: [entryPoint],
		outfile: outputFile,
		plugins: [
			globImport(),
			global.watch && {
				name: "watch",
				setup({ onEnd, onStart, initialOptions }) {
					let before;
					onStart(() => {
						before = performance.now();
					});
					onEnd(e => {
						const { outfile } = initialOptions;
						const after = performance.now();
						if (e.errors.length) return console.log(`[${(after - before).toFixed(2)}ms] build has errors`);
						console.log(`[${(after - before).toFixed(2)}ms] ${outfile}`);
					});
				}
			},
			css(),
			configPlugin(pluginRoot),
			componentsAutoLoader(),
			modulesAutoLoader(),
			outputFile && houseKeeping(pluginRoot)
		].filter(Boolean)
	};
};
