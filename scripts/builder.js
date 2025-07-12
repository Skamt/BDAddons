const { program } = require("commander");
const esbuild = require("esbuild");
const { promiseHandler, mergeDeep } = require("./helpers");
const { join, resolve } = require("node:path");
const { readdirSync, existsSync } = require("node:fs");
const getConfig = require("./esbuild.config.js");

global.log = console.log.bind(console);
const pkg = require(resolve("package.json"));
const { pluginsFolder, releaseFolder, baseConfig } = pkg.buildConfig;
const pluginsDir = resolve(pluginsFolder);

















function getPluginObject(pluginNameOrDir) {
	const pluginPath = resolve(pluginsDir, pluginNameOrDir);
	const isDirExists = existsSync(pluginPath);
	if (!isDirExists) return;
	const configPath = resolve(pluginPath, "config.json");
	const isConfigExists = existsSync(configPath);
	if (!isConfigExists) return;
	return { name: pluginPath.split("\\").pop(), configPath, pluginPath };
}

function getPlugins() {
	return readdirSync(pluginsDir)
		.map(getPluginObject)
		.filter(Boolean)
		.sort((a, b) => a.name.localeCompare(b.name));
}

async function build(list) {
	for (let i = 0; i < list.length; i++) {
		const { name, configPath, pluginPath } = list[i];
		log(name, configPath, pluginPath);
	}
}

async function buildPlugin({ configPath, pluginPath }) {
	const config = mergeDeep(require(configPath), baseConfig);
	const entryPoint = resolve(pluginPath, "index");
	const releaseFile = join(releaseFolder, config.info.name, `${config.info.name}.plugin.js`);
	const esbuildConfig = getConfig(entryPoint, releaseFile);
	const context = await esbuild.context(esbuildConfig);

	await context.watch();
}

const target = process.argv.slice(2)[0] || process.env.PWD || process.env.INIT_CWD;

const pluginObj = getPluginObject(target);
if (!pluginObj) {
	console.error(`Unknown plugin [${target}]`);
	log(`Available plugins:`);
	const plugins = getPlugins();
	log(plugins.map(a => `-\u0020${a.name}`).join("\n"));
} else buildPlugin(pluginObj);
