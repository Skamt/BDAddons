const esbuild = require("esbuild");
const { program } = require("commander");
const { join } = require("node:path");
const getConfig = require("./esbuild.config.js");
const { log, getPlugins, getPluginObject } = require("./helpers");

function getOutputFile(name) {
	return global.dev ? 
		join(global.bdFolder, "plugins", `${name}.plugin.js`) :
		join(global.releaseFolder, name, `${name}.plugin.js`);
}

async function watch(entryPoint, config, pluginRoot, outputFile) {
	const esbuildConfig = getConfig({ watch: true, config, entryPoint, outputFile, pluginRoot });
	const ctx = await esbuild.context(esbuildConfig);
	await ctx.watch();

	const readline = require("node:readline");
	readline.emitKeypressEvents(process.stdin);
	if (process.stdin.isTTY) process.stdin.setRawMode(true);

	let working = false;
	const { promise, resolve } = Promise.withResolvers();
	process.stdin.on("keypress", async (chunk, { ctrl, name }) => {
		if (ctrl && name === "c" && !working) {
			working = true;
			await ctx.dispose();
			resolve();
		}
	});

	return promise;
}

async function buildPlugin(entryPoint, config, pluginRoot, outputFile) {
	const before = performance.now();
	log(`\n===== Building ${config.info.name} =====\n`);
	const esbuildConfig = getConfig({ config, entryPoint, outputFile, pluginRoot });
	await esbuild.build(esbuildConfig).catch(console.error);
	const after = performance.now();
	log(`Finished building in ${(after - before).toFixed(2)}ms`);
	log(`Output: ${outputFile}`);
}

function watchPlugin(entryPoint, config, pluginRoot, outputFile) {
	log(`Watching ${entryPoint}`);
	watch(entryPoint, config, pluginRoot, outputFile)
		.then(() => process.exit(0));
}

async function buildAll() {
	const plugins = getPlugins();
	log(`Building ${plugins.length} plugin${plugins.length > 1 ? "s" : ""}`);
	const before = performance.now();
	for (let i = 0; i < plugins.length; i++) {
		const { entryPoint, configPath, pluginRoot } = plugins[i];
		const config = require(configPath);
		const outputFile = getOutputFile(config.info.name);
		await buildPlugin(entryPoint, config, pluginRoot, outputFile);
	}
	const after = performance.now();
	log(`Finished building in ${(after - before).toFixed(2)}ms`);
}

program
	.command("build [pluginName]")
	.alias("b")
	.option("-p, --prod", "builds at release location")
	.option("-d, --dev", "builds at BetterDiscord location")
	.option("-w, --watch", "enable watch mode")
	.option("-a, --all", "build all plugins")
	.description("builds a given plugin")
	.action((target, { watch, all, prod, dev }) => {
		if (!target && all) return buildAll();

		if (all) console.info("ignored 'all' option for invalid use");

		global.prod = prod;
		global.dev = dev;
		global.watch = watch;

		const pluginObject = getPluginObject(target || process.env.PWD || process.env.INIT_CWD);
		if (!pluginObject) {
			console.error("No valid plugin found");
			log(getPlugins().map(a => `-\u0020${a.name}`).join("\n"));
			return;
		}

		const { entryPoint, configPath, pluginRoot } = pluginObject;
		const config = require(configPath);
		const outputFile = getOutputFile(config.info.name);

		if (watch) watchPlugin(entryPoint, config, pluginRoot, outputFile);
		else buildPlugin(entryPoint, config, pluginRoot, outputFile);
	});
