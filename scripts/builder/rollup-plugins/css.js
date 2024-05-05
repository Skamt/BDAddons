const { createFilter } = require("@rollup/pluginutils");
module.exports = function css() {
	const filter = createFilter(["**/*.css"]);
	const styles = [];

	return {
		name: "css",
		transform(code, id) {
			if (!filter(id)) return;
			styles.push(code);
			return "";
		},
		outro() {
			return `const css = \`${styles.join("\n")}\`;`;
		}
	};
};
