const fs = require("fs");
const path = require("path");
const parser = require('./parser');
const { beautify } = require('../helpers.js');
const template = fs.readFileSync(path.join(__dirname, "template.js")).toString();

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

module.exports = (pluginRootFile, pluginFolder, pluginFiles, config) => {

	const content = parser(pluginRootFile, pluginFolder, pluginFiles);
	let result = buildMeta(config);
	if (process.argv.slice(2).length) {
		result += `{{CONFIG_TEMPLATE}}module.exports = ({{PLUGIN_TEMPLATE}})(BdApi)`;
		result = result.replace(`{{CONFIG_TEMPLATE}}`, `const config = ${beautify(JSON.stringify(config),{"brace_style": "collapse"}).replace(/"((?:[A-Za-z]|[0-9]|_)+)"\s?:/g, "$1:")};`)
		result = result.replace(`{{PLUGIN_TEMPLATE}}`, `${content}`);
	} else {
		result += template;
		result = result.replace(`const config = "";`, `const config = ${beautify(JSON.stringify(config),{"brace_style": "collapse"}).replace(/"((?:[A-Za-z]|[0-9]|_)+)"\s?:/g, "$1:")};`)
		result = result.replace(`const plugin = "";`, `const plugin = ${content};`);
	}
	return beautify(result);
}