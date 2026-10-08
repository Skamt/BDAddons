const { program } = require("commander");

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

const getIndex = () => `import "./patches/*";
import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";


Plugin.onStart(() => {
	after();
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
		const pluginsFolderPath = path.join(global.pluginsFolder, pluginName);

		if (!fs.existsSync(pluginsFolderPath)) fs.mkdirSync(pluginsFolderPath);
		fs.writeFileSync(path.join(pluginsFolderPath, "config.json"), getConfig(pluginName));
		fs.writeFileSync(path.join(pluginsFolderPath, "index.js"), getIndex());
		// fs.writeFileSync(path.join(pluginsFolderPath, "styles.css"), "");
		console.log("Done!");
	});
