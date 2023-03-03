const fs = require("fs");
const path = require("path");

module.exports = function getAllFiles(dirPath, arrayOfFiles, mask) {
	files = fs.readdirSync(dirPath);

	arrayOfFiles = arrayOfFiles || [];

	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles, mask);
		} else {
			arrayOfFiles.push(path.join(dirPath + "/", file).replace(mask, ''));
		}
	});
	return arrayOfFiles;
}