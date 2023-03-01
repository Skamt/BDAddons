const path = require("path");
const jsx = require("./jsxParser.js");
const js = require("./jsParser.js");
const css = require("./cssParser.js");
const other = require("./otherParser.js");
const DiscordModules = require("./../../../DiscordModules.js");

module.exports = (content, pluginFolder, pluginFiles) => {
	for (const fileName of pluginFiles)
		content = content.replace(new RegExp(`require\\(('|"|\`)${fileName}('|"|\`)\\)`, "g"), () => {
			const filePath = path.join(pluginFolder, fileName);
			if (fileName.endsWith(".jsx")) return jsx(filePath);
			if (fileName.endsWith(".js")) return js(filePath);
			// if (fileName.endsWith(".css")) return css(filePath);
			else return other(filePath);
		});
	Object.keys(DiscordModules).forEach(Module => {
		content = content.replace(new RegExp(`DiscordModules.${Module}`, "g"), () => DiscordModules[Module]);
	});
	content = content.replace("DiscordModules.ALL", () =>
		`[${Object.entries(DiscordModules).map(([name,filter]) => `["${name}",${filter}]\n`)}]`
	);
	return content;
};