const fs = require("fs");
const path = require("path");
const { rollup, watch } = require("rollup");
const mergeDeep = require('./helpers/mergeDeep.js');

const getInputConfig = require('./rollup.config.input.js');
const getOutputConfig = require('./rollup.config.output.js');

const projectPath = path.resolve('.');
const {
	pluginsFolder,
	releaseFolder,
	baseConfig
} = require(path.join(projectPath, "package.json")).buildConfig;

const arg = process.argv.slice(2)[0];

switch (arg) {
	case "dev":
		dev();
		break;
	case "build":
		buildTarget();
		break;
	case "all":
		buildAll();
		break;
	default:
		process.exit(0);
}

function getConfig(inputPath, outputPath, config) {
	const input = getInputConfig(inputPath, config);
	const output = getOutputConfig(outputPath, config);

	return { input, output }
}

function buildTarget() {
	build([process.env.PWD || process.env.INIT_CWD]);
}

function buildAll() {
	const pluginsDir = path.join(projectPath, pluginsFolder);
	const list =
		fs.readdirSync(pluginsDir)
		.filter(f => fs.lstatSync(path.join(pluginsDir, f)).isDirectory())
		.map(f => path.join(pluginsDir, f));
	build(list);
}

async function build(list) {
	console.log("");
	console.log(`Building ${list.length} plugin${list.length > 1 ? "s" : ""}`);
	console.time("Build took");
	for (let i = 0; i < list.length; i++) {
		const pluginFolder = list[i];
		const pluginConfig = path.join(pluginFolder, "config.json");

		if (!fs.existsSync(pluginConfig)) {
			console.error(`No config for [${pluginConfig}]`);
			continue;
		}

		const config = mergeDeep(require(pluginConfig), baseConfig);
		const buildFile = path.join(releaseFolder, config.info.name, `${config.info.name}.plugin.js`);

		const rollupConfig = getConfig(pluginFolder, buildFile, config);

		console.log(`\n${config.info.name}`);

		try {
			const bundle = await rollup(rollupConfig.input);
			await bundle.write(rollupConfig.output);
			console.log(`${config.info.name} built successfully`);
		} catch (e) {
			console.log(e.toString());
			console.log(`${config.info.name} Error During build`);
		}


		console.log("===========================================================");
	}
	console.timeEnd("Build took");
}

function dev() {

	const bdFolder = `${process.env.APPDATA}/BetterDiscord/`;
	const pluginFolder = process.env.PWD || process.env.INIT_CWD;

	const pluginConfig = path.join(pluginFolder, "config.json");

	if (!fs.existsSync(pluginConfig)) {
		console.error(`[${pluginConfig}] Could not find config file.`);
		process.exit(0);
	}

	const config = mergeDeep(require(pluginConfig), baseConfig);
	const buildFile = path.join(bdFolder, "plugins", `${config.info.name}.plugin.js`);

	const rollupConfig = getConfig(pluginFolder, buildFile, config);

	console.log(`Watching ${config.info.name} Plugin`);
	const watcher = watch({
		...rollupConfig.input,
		output: rollupConfig.output,
	});

	watcher.on("event", (event) => {
		switch (event.code) {
			case "BUNDLE_END":
				event.result.close();
				break;
			case "ERROR":
				console.log(event.error);
				break;
		}
	});

	watcher.on("change", (file, e) => {
		console.log(`Changed ${file}`);
	});

}