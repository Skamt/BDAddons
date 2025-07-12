const esbuild = require("esbuild");
const { resolve } = require("node:path");
const { readdirSync, existsSync } = require("node:fs");
const { readFile } = require("node:fs/promises");
const log = console.log.bind(console);

function getPluginObject(pluginNameOrDir) {
	const pluginRoot = resolve(global.pluginsFolder, pluginNameOrDir);
	const isDirExists = existsSync(pluginRoot);
	if (!isDirExists) return;
	const entryPoint = resolve(pluginRoot, "index");
	if (!entryPoint) return;
	const configPath = resolve(pluginRoot, "config.json");
	const isConfigExists = existsSync(configPath);
	if (!isConfigExists) return;
	return { name: pluginRoot.split("\\").pop(), entryPoint, configPath, pluginRoot };
}

function getPlugins() {
	return readdirSync(global.pluginsFolder).map(getPluginObject).filter(Boolean);
}

const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

const isObject = item => item && typeof item === "object" && !Array.isArray(item);

function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key])
					Object.assign(target, {
						[key]: {}
					});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return mergeDeep(target, ...sources);
}

function parseJSON(str) {
	try {
		return JSON.parse(str);
	} catch {
		return {};
	}
}

function buildMeta(config) {
	const metaString = ["/**"];
	const line = (label, val) => val && metaString.push(` * @${label} ${val}`);
	line("name", config.info.name);
	line("description", config.info.description);
	line("version", config.info.version);
	line("author", config.info.authors.map(a => a.name).join(", "));
	line("website", config.info.github);
	line("source", config.info.source);
	metaString.push(" */");
	metaString.push("");
	return metaString.join("\n");
}

async function readAndParseJSON(path) {
	const jsonStr = await readFile(path);
	return parseJSON(jsonStr);
}

async function buildConfig(pkgPath, pluginConfigPath) {
	const { baseConfig } = await readAndParseJSON(pkgPath);
	const pluginConfig = await readAndParseJSON(pluginConfigPath);
	const config = mergeDeep(pluginConfig, baseConfig);
	return config;
}


module.exports.buildConfig = buildConfig;
module.exports.parseJSON = parseJSON;
module.exports.promiseHandler = promiseHandler;
module.exports.mergeDeep = mergeDeep;
module.exports.log = log;
module.exports.getPlugins = getPlugins;
module.exports.getPluginObject = getPluginObject;
module.exports.isObject = isObject;
module.exports.buildMeta = buildMeta;
