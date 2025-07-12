const { parseJSON, mergeDeep } = require("../helpers");
const { mkdir, readFile, writeFile } = require("node:fs/promises");
const { resolve } = require("node:path");

async function readAndParseJSON(path) {
	const jsonStr = await readFile(path);
	return parseJSON(str);
}

async function buildConfig(pkgPath, pluginConfigPath) {
	const { baseConfig } = await readAndParseJSON(pkgPath);
	const pluginConfig = await readAndParseJSON(pluginConfigPath);
	const config = mergeDeep(pluginConfig, baseConfig);
	return JSON.stringify(config, null, 4);
}

module.exports = (projectRoot, pluginRoot) => {
	return {
		name: "houseKeeping",
		setup(build) {
			build.onResolve({ filters: /^@Config$/ }, async ({ path }) => {
				const pkgPath = resolve(projectRoot, "package.json");
				const pluginConfigPath = resolve(pluginRoot, "config.json");
				const config = await buildConfig(pkgPath, pluginConfigPath);

				return {
					contents: config,
					watchFiles: [pkgPath, pluginConfigPath]
				};
			});

			build.onEnd(({ outputFiles }) => {
				console.log(outputFiles);
			});
		}
	};
};
