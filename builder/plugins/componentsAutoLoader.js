const path = require("path");

const regex = /@Components\/(.+)/;
const filter = id => id.match(regex);

function getCompName(id) {
	const [, moduleName] = id.match(regex);
	return moduleName;
}

module.exports = function componentsAutoLoader() {
	return {
		name: "components-auto-loader",
		setup(build) {
			build.onResolve({ filter: /@Components\/(.+)/ }, ({ path: id }) => ({
				path: path.resolve("common", "Components", getCompName(id), "index.jsx")
			}));
		}
	};
};
