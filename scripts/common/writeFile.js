const fs = require("fs");
const path = require("path");

module.exports = function(path, content) {
	fs.writeFileSync(path, content);
}