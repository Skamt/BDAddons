const buildMeta = require("../helpers/buildMeta.js");
const beautify = require("./beautify.js");

module.exports = function meta(pluginConfig) {
	return {
		name: "meta",
		intro() {		
			return `${buildMeta(pluginConfig)}\nconst config = ${beautify.b(JSON.stringify(pluginConfig))}`;
		}
	};
};
