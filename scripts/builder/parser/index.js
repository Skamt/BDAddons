const path = require("path");
const jsx = require('./jsxParser.js');
const js = require('./jsParser.js');
const other = require('./otherParser.js');

module.exports = (content, pluginFolder, files) => {
	for (const fileName of files)
		content = content.replace(new RegExp(`require\\(('|"|\`)${fileName}('|"|\`)\\)`, "g"), () => {
			const filePath = path.join(pluginFolder, fileName);
			if (fileName.endsWith(".jsx")) return jsx(filePath);
			if (fileName.endsWith(".js")) return js(filePath);
			else return other(filePath);
		});
	return content;
};