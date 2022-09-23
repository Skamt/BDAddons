const fs = require("fs");

module.exports = (filePath) => {
	return fs.readFileSync(filePath).toString().replace(/module\.exports\s*=\s*/, "");
}