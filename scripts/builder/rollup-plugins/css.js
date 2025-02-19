const { createFilter } = require("@rollup/pluginutils");
module.exports = function css() {
	const filter = createFilter(["**/*.css"]);
	let styles = {};

	return {
		name: "css",
		transform(code, id) {
			if (!filter(id)) return;
			if (styles[id] !== code) styles[id] = code;
			return "";
		},
		outro() {
			return `const css = \`${Object.values(styles).join("\n")}\`;`;
		}
	};
};
