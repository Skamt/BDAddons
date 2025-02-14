const path = require("path");

module.exports = () => ({
	name: "Code Regions",
	transform(code, id) {
		const relativePath = path.relative(".", id);
		return `// ${relativePath}\n${code.trim()}\n`;
	}
});
