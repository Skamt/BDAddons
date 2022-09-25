const fs = require("fs");

module.exports = filePath => {
	const stuff = `\`${fs.readFileSync(filePath).toString()}\``;
	return stuff.replace(/[\r\n\t]/g, "");
};