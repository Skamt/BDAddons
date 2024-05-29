const fs = require("fs");
const path = require("path");

const pluginName = process.argv.pop();
const projectPath = path.resolve('.');
const { buildConfig: { pluginsFolder } } = require(path.join(projectPath, "package.json"));
const pluginsFolderPath = path.join(projectPath, pluginsFolder, pluginName);

const config = `{
	"info": {
		"name": "${pluginName}",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/${pluginName}/${pluginName}.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/${pluginName}"
	}
}`;

const index = `import "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";

export default class ${pluginName} {
	start() {
		try {
			DOM.addStyle(css);
			
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}

const css = "";`;

if (!fs.existsSync(pluginsFolderPath))
	fs.mkdirSync(pluginsFolderPath);

fs.writeFileSync(path.join(pluginsFolderPath, "config.json"), config);
fs.writeFileSync(path.join(pluginsFolderPath, "index.js"), index);
fs.writeFileSync(path.join(pluginsFolderPath, "styles.css"), "");
