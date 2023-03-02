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
	content = content.replace('failsafe;',`
	const brokenModules = Object.entries(Modules).filter(([, module]) => !module).map(([moduleName]) => moduleName);
	if (brokenModules.length > 0) {
		return () => ({
			start() {
				BdApi.showConfirmationModal(config.info.name,
					["Plugin is broken, take a screenshot of this popup and post an issue on the github repo of this plugin",
						...brokenModules
					]);
				BdApi.Plugins.disable('LazyLoadChannels');
				console.log(config.info.name, ...['brokenModules:', ...brokenModules])
			},
			stop() {}
		});
	}`)
	return content;
};