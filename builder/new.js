const { program } = require("commander");
const { getPlugins } = require("./helpers");

const fs = require("fs");
const path = require("path");

const getConfig = pluginName => `{
	"info": {
		"name": "${pluginName}",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/${pluginName}/${pluginName}.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/${pluginName}"
	}
}`;

const getIndex = pluginName => `import "./styles";
import "./patches/*";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";


Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
`;


program
	.command("new [pluginName]")
	.alias("n")
	.description("Scaffold a new plugin")
	.action(pluginName => {
		if (!pluginName) return console.log("Must provide plugin name");
		console.log(`Creating ${pluginName}`);
		const pluginsFolderPath = path.join(pluginsFolder, pluginName);
		
		if (!fs.existsSync(pluginsFolderPath)) fs.mkdirSync(pluginsFolderPath);
		fs.writeFileSync(path.join(pluginsFolderPath, "config.json"), getConfig(pluginName));
		fs.writeFileSync(path.join(pluginsFolderPath, "index.js"), getIndex(pluginName));
		fs.writeFileSync(path.join(pluginsFolderPath, "styles.css"), "");
		console.log("Done!");
	});
