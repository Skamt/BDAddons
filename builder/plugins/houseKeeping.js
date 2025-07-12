const { buildConfig } = require("../helpers");
const { parseJSON, buildMeta, mergeDeep } = require("../helpers");
const { mkdir, writeFile } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { resolve, dirname } = require("node:path");
const beautify = require("js-beautify").js;

async function wf(filePath, data) {
	const dir = dirname(filePath);
	if (!existsSync(dir)) await mkdir(dir, { recursive: true });

	await writeFile(filePath, data, "utf8");
}

const beautifyConfig = {
	indent_size: "1",
	indent_char: "\t",
	max_preserve_newlines: "2",
	preserve_newlines: true,
	keep_array_indentation: false,
	break_chained_methods: false,
	indent_scripts: "keep",
	brace_style: "preserve-inline",
	space_before_conditional: true,
	unescape_strings: false,
	jslint_happy: false,
	end_with_newline: true,
	wrap_line_length: "0",
	indent_inner_html: false,
	comma_first: false,
	e4x: false,
	indent_empty_lines: false
};

module.exports = pluginRoot => {
	return {
		name: "houseKeeping",
		async setup(build) {
			const { outfile } = build.initialOptions;

			build.initialOptions.write = false;

			build.onEnd(async ({ outputFiles }) => {
				const builderConfigPath = resolve(global.appRoot, "builder.json");
				const pluginConfigPath = resolve(pluginRoot, "config.json");
				const config = await buildConfig(builderConfigPath, pluginConfigPath);
				const { text } = outputFiles.find(a => /.js$/.test(a.path)) || [];
				if (!text) return;
				const output = `${buildMeta(config)}\n${beautify(text, beautifyConfig)}`;
				await wf(outfile, output);
			});
		}
	};
};
