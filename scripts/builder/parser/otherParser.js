const fs = require("fs");

module.exports = (filePath) => {
	return `\`${fs.readFileSync(filePath).toString()}\``;
}