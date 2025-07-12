const { readFile } = require("node:fs/promises");

const filter = /^.*\.css$/;

module.exports = function css() {
	return {
		name: "css",
		setup(build) {
			build.onLoad({ filter }, async ({ path }) => {
				const file = await readFile(path, "utf-8");
				return {
					contents: !file ? "" :`import StylesLoader from "@Utils/StylesLoader";
				StylesLoader.push(\`${file}\`);`
				};
			});
		}
	};
};
