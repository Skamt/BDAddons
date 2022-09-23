const fs = require("fs");
const path = require("path");

const isObject = item => (item && typeof item === 'object' && !Array.isArray(item));

module.exports.mergeDeep = function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, {
					[key]: {}
				});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return mergeDeep(target, ...sources);
}

module.exports.writeFile = (path, content) => {
	fs.writeFileSync(path, content);
}

module.exports.getAllFiles = function getAllFiles(dirPath, arrayOfFiles, mask) {
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