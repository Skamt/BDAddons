const css = require("./plugins/css");
const componentsAutoLoader = require("./plugins/componentsAutoLoader");
const modulesAutoLoader = require("./plugins/modulesAutoLoader");
const configPlugin = require("./plugins/config");
const houseKeeping = require("./plugins/houseKeeping");
const globImport = require("esbuild-plugin-import-glob").default;

module.exports = ({ watch, config, entryPoint, outputFile, pluginRoot }) => {
	return {
		format: "cjs",
		bundle: true,
		dropLabels: [global.dev ? "" : "DEV"],
		resolveExtensions: [".json", ".js", ".jsx", ".css"],
		loader: {
			".js": "jsx",
			".css": "css"
		},
		external: ['electron'],
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
					onEnd(() => {
						const { outfile } = initialOptions;
						const after = performance.now();
						console.log(`[${(after - before).toFixed(2)}ms] ${outfile}`);
					});
				}
			},
			{
				name: "pluginRootAlias",
				setup({ onResolve, resolve }) {
					onResolve({ filter: /^@\// }, ({ path }) =>
						resolve(path.replace("@", pluginRoot), {
							kind: "import-statement",
							resolveDir: pluginRoot
						})
					);
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
