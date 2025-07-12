const { buildConfig } = require("../helpers");
const { resolve } = require("node:path");

module.exports = pluginRoot => {
	return {
		name: "config",
		async setup(build) {
			const builderConfigPath = resolve(global.appRoot, "builder.json");
			const pluginConfigPath = resolve(pluginRoot, "config.json");

			build.onResolve({ filter: /^@Config$/ }, async ({ path }) => {
				return { path, namespace: "config", watchFiles: [builderConfigPath, pluginConfigPath] };
			});

			build.onLoad({ filter: /^@Config$/, namespace: "config" }, async ({ path }) => {
				const config = await buildConfig(builderConfigPath, pluginConfigPath);

				return {
					contents: `export default ${JSON.stringify(config, null, "\t")}`
				};
			});
		}
	};
};
