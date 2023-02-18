const path = require("path");
const fs = require("fs");
const projectPath = path.resolve('.');
const buildPlugin = require("./buildPlugin.js");
const { mergeDeep, getAllFiles } = require("../helpers.js");
const { pluginsFolder, releaseFolder, baseConfig } = require(path.join(projectPath, "package.json")).buildConfig;

const pluginsPath = path.join(projectPath, pluginsFolder);
const releasePath = path.join(projectPath, releaseFolder);

const bdFolder = `${process.env.APPDATA}/BetterDiscord/`;
const arg = process.argv.slice(2)[0];
const list = arg === "a" 
	? fs.readdirSync(pluginsPath)
		.filter(f => fs.lstatSync(path.join(pluginsPath, f)).isDirectory())
		.map(f => path.join(pluginsPath, f)) 
	: [process.env.PWD || process.env.INIT_CWD]

console.log("");
console.log(`Building ${list.length} plugin${list.length > 1 ? "s" : ""}`);
console.time("Build took");
list.forEach(pluginFolder => {
	const configPath = path.join(pluginFolder, "config.json");
	if (fs.existsSync(configPath)) {
		const config = mergeDeep(require(configPath), baseConfig);

		const pluginFiles =
			getAllFiles(pluginFolder, null, pluginFolder.replace(/\//g, "\\"))
			.filter(p => p != "config.json" && p != "index.js")
			.map(f => f.substr(1).replace(/\\/g, "/"));

		const pluginContent = fs.readFileSync(path.join(pluginFolder, "index.js")).toString();
		const pluginSource = buildPlugin(pluginContent, pluginFolder, pluginFiles, config);

		const buildDir = path.join(releasePath, config.info.name);
		const buildFile = path.join(releasePath, config.info.name, `${config.info.name}.plugin.js`);
		if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
		fs.writeFileSync(buildFile, pluginSource);

		console.log(`Copying ${config.info.name} to BD folder`);
		fs.writeFileSync(path.join(bdFolder, "plugins", config.info.name + ".plugin.js"), pluginSource);

		console.log(`${config.info.name} built successfully`);
		console.log(`${config.info.name} saved as ${buildFile}`);

	} else
		console.error(`Could not find "${configPath}". Skipping...`);
});
console.timeEnd("Build took");