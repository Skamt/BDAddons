const { existsSync } = require("node:fs");
const { resolve, join } = require("node:path");

const appRoot = (() => {
	let currentDir = __dirname;
	while (!existsSync(join(currentDir, "package.json"))) {
		currentDir = resolve(currentDir, "..");
	}
	return currentDir;
})();

const builderConfigPath = resolve(appRoot, "builder.json");
const { pluginsFolder, releaseFolder, baseConfig } = require(builderConfigPath);

global.appRoot = appRoot;
global.pkg = require(resolve(appRoot, "package.json"));
global.builderConfigPath = builderConfigPath;
global.pluginsFolder = resolve(appRoot, pluginsFolder);
global.releaseFolder = resolve(appRoot, releaseFolder);
global.baseConfig = baseConfig;

const windows = process.env.APPDATA;
const mac = process.env.HOME + "/Library/Application Support";
const linux = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config";
const bdFolder = process.env.BDFOLDER || `${process.platform == "win32" ? windows : process.platform == "darwin" ? mac : linux}/BetterDiscord/`;

global.bdFolder = bdFolder;
