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

module.exports = (pluginContent, pluginFolder, pluginFiles, config) => {

	const content = parser(pluginContent, pluginFolder, pluginFiles);
	let result = buildMeta(config);
	if (config.keep) {
		result += `const config = {{ PLUGIN__CONFIG }};{{ PLUGIN__BODY }}`;
		delete config.keep; // Temporary
	} else if (config["no-zpl"]) {
		result += `const config = {{ PLUGIN__CONFIG }};module.exports = ({{ PLUGIN__BODY }})();`;
		delete config["no-zpl"]; // Temporary
	} else
		result += template;


	result = result.replace(`{{ PLUGIN__CONFIG }}`, `${beautify(JSON.stringify(config),{"brace_style": "collapse"}).replace(/"((?:[A-Za-z]|[0-9]|_)+)"\s?:/g, "$1:")}`)
	result = result.replace(`{{ PLUGIN__BODY }}`, `${content}`);
	return beautify(result);
}