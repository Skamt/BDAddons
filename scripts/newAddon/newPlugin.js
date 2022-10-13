const fs = require("fs");
const path = require("path");
const pluginName = process.argv.pop();
const projectPath = path.resolve('.');
const { buildConfig: { pluginsFolder } } = require(path.join(projectPath, "package.json"));
const pluginsFolderPath = path.join(projectPath, pluginsFolder, pluginName);
const { getAllFiles, writeFile, beautify } = require("../helpers.js");
const templates = [
	[require("./index.js"), index, "index.js"],
	[require("./config.json"), config, "config.json"]
]

function index(content) {
	return `module.exports = ${content.toString().replace("pluginTEMPLATE", pluginName)}`;
}

function config(content) {
	content.info.name = pluginName;
	content.info.source = `${content.info.source}${pluginName}/${pluginName}.plugin.js`;
	content.info.github = `${content.info.github}${pluginName}`;
	return beautify(JSON.stringify(content), { "brace_style": "collapse" });
}

if (!fs.existsSync(pluginsFolderPath))
	fs.mkdirSync(pluginsFolderPath);

templates.forEach(([content, parser, fileName]) => {
	writeFile(path.join(pluginsFolderPath, fileName), parser(content));
});