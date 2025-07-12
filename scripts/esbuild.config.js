const css = require("./plugins/css");
const componentsAutoLoader = require("./plugins/componentsAutoLoader");
const modulesAutoLoader = require("./plugins/modulesAutoLoader");
const houseKeeping = require("./plugins/houseKeeping");



module.exports = (inputPath, outputPath, projectRoot, pluginRoot) => ({
	format: "cjs",
	bundle: true,
	platform: "browser",
	jsx: "transform",
	treeShaking: true,
	write: false,
	target: "chrome128",
	entryPoints: [inputPath],
	outfile: outputPath,
	plugins: [css(), componentsAutoLoader(), modulesAutoLoader(), houseKeeping()]
});
