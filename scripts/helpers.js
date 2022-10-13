const fs = require("fs");
const path = require("path");
const beautify = require('js-beautify').js;

const isObject = item => (item && typeof item === 'object' && !Array.isArray(item));


const config = {
	"indent_size": "1",
	"indent_char": "\t",
	"max_preserve_newlines": "-1",
	"preserve_newlines": true,
	"keep_array_indentation": false,
	"break_chained_methods": false,
	"indent_scripts": "keep",
	"brace_style": "preserve-inline",
	"space_before_conditional": true,
	"unescape_strings": false,
	"jslint_happy": false,
	"end_with_newline": true,
	"wrap_line_length": "0",
	"indent_inner_html": false,
	"comma_first": false,
	"e4x": false,
	"indent_empty_lines": false
};

module.exports.beautify = (code, op) => {
	return beautify(code, { ...config, ...op });
};
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