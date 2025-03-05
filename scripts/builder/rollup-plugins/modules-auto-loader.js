const DiscordModules = require("../DiscordModules.json");

const regex = /@(Patch|Modules|Enums|Stores)\/(.+)/;
const filter = id => id.match(regex);

function getModuleInfo(id) {
	const [, target, moduleName] = id.match(regex);
	return [target, moduleName];
}

const ModulesHandler = {
	resolve(moduleName, type) {
		const { filter, options } = DiscordModules.Modules[moduleName];
		const accessor = type === "Patch" ? "getModuleAndKey" : "getModule";
		const faileSafe = type === "Patch" ? " || {};" : "";
		const isFilter = filter.includes("Filters.") ? "Filters," : "";
		return `import { {{filter}}${accessor} } from "@Webpack"; export default ${accessor}(${filter},${options})${faileSafe}`.replace("{{filter}}", isFilter);
	}
};

const StoresHandler = {
	resolve(moduleName) {
		return `import { getStore } from "@Webpack"; export default getStore("${moduleName}");`;
	}
};

const EnumsHandler = {
	resolve(moduleName) {
		const { filter, options, fallback } = DiscordModules.Enums[moduleName];
		return `import { Filters, getModule } from "@Webpack"; export default getModule(${filter},${options}) || ${JSON.stringify(fallback, null, 4)};`;
	}
};

module.exports = function componentsAutoLoader() {
	return {
		name: "modules-auto-loader",
		resolveId(id) {
			return filter(id) ? id : null;
		},
		load(id) {
			if (filter(id)) {
				const [target, moduleName] = getModuleInfo(id);
				switch (target) {
					case "Patch":
					case "Modules":
						return ModulesHandler.resolve(moduleName, target);
					case "Stores":
						return StoresHandler.resolve(moduleName);
					case "Enums":
						return EnumsHandler.resolve(moduleName);
				}
			}
		}
	};
};