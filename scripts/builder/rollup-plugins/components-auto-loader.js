const path = require("path");

const regex = /@Components\/(.+)/;
const filter = id => id.match(regex);

function getCompName(id) {
	const [, moduleName] = id.match(regex);
	return moduleName;
}

module.exports = function componentsAutoLoader() {
	return {
		name: 'components-auto-loader',
		resolveId(id) {
			return filter(id)  ?
				path.resolve('common', 'Components', getCompName(id), 'index.jsx') : null;
		}
	};
}