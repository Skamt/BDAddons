const fs = require("fs");
const path = require("path");
const { rollup, watch } = require("rollup");
const mergeDeep = require('./helpers/mergeDeep.js');
const pkg = require(path.resolve("package.json"));
const getConfig = require('./rollup.config.js');

const {
	pluginsFolder,
	releaseFolder,
	baseConfig
} = pkg.buildConfig;

const pluginsDir = path.resolve(pluginsFolder);
const bdFolder = `${process.env.APPDATA}/BetterDiscord/`;

function buildAll() {
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

		const { input, output } = getConfig(pluginFolder, buildFile, config);

		console.log(`\n===== ${config.info.name} =====\n`);

		try {
			const bundle = await rollup(input);
			await bundle.write(output);
			output.file = path.join(bdFolder, "plugins", `${config.info.name}.plugin.js`);
			await bundle.write(output);
			console.log(`${config.info.name} built successfully`);
		} catch (e) {
			console.log(`☺ Error: ${e}`);
			console.log(`☺ Error building: ${config.info.name}`);
		}
		
		console.log("\n==========================================");
	}
	console.timeEnd("Build took");
}

function dev() {
	
	const pluginFolder = process.env.PWD || process.env.INIT_CWD;

	const pluginConfig = path.join(pluginFolder, "config.json");

	if (!fs.existsSync(pluginConfig)) {
		console.error(`[${pluginConfig}] Could not find config file.`);
		process.exit(0);
	}

	const config = mergeDeep(require(pluginConfig), baseConfig);
	const buildFile = path.join(bdFolder, "plugins", `${config.info.name}.plugin.js`);

	const { input, output } = getConfig(pluginFolder, buildFile, config);

	console.log(`\nWatching ${config.info.name} Plugin\n`);

	const watcher = watch({
		...input,
		output: output,
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

	watcher.on("change", function(file) {
		console.log(`[===] Changed: ${file.replace(pluginsDir,'')}`);
	});

	const readline = require('readline');

	readline.emitKeypressEvents(process.stdin);

	if (process.stdin.isTTY)
		process.stdin.setRawMode(true);

	process.stdin.on('keypress', (chunk, { ctrl, name }) => {
		if (ctrl && name == 'c')
			build([pluginFolder])
			.then(() => process.exit(0));

	});
}


const arg = process.argv.slice(2)[0];
switch (arg) {
	case "dev":
		dev();
		break;
	case "all":
		buildAll();
		break;
	default:
		build([process.env.PWD || process.env.INIT_CWD]);
		break;
}