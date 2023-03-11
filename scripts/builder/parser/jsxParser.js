const fs = require("fs");
const babel = require("@babel/core");

module.exports = filePath => {
	const code = fs
		.readFileSync(filePath)
		.toString();
	const formatterCode = babel.transformSync(code, {
		retainLines: true,
		plugins: [
			[
				"@babel/plugin-transform-react-jsx", {
					pure: false,
					useSpread: true
				}
			]
		]
	}).code;

	return formatterCode.slice(0, -1);
};