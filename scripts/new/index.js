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

const index = `import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp } from "@Utils";
import CopyButtonComponent from "./components/CopyButtonComponent";
import ImageModal from "@Patch/ImageModal";

export default class ${pluginName} {
	start() {
		try {
			DOM.addStyle(css);
			const { module, key } = ImageModal;
			if (module && key)
				Patcher.after(module, key, (_, __, returnValue) => {
					
				});
			else Logger.patch("patchImageModal");
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}`;

if (!fs.existsSync(pluginsFolderPath))
	fs.mkdirSync(pluginsFolderPath);

fs.writeFileSync(path.join(pluginsFolderPath, "config.json"), config);
fs.writeFileSync(path.join(pluginsFolderPath, "index.js"), index);
