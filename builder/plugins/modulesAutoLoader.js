const { resolve } = require("node:path");
const DiscordModules = require(resolve(global.appRoot, "DiscordModules.json"));

const regex = /@(Patch|Modules|Enums|Stores)\/(.+)/;

function getModuleInfo(id) {
	const [, target, moduleName] = id.match(regex);
	return [target, moduleName];
}

function getAll(){
	const res = [];
	const keys = Object.keys(DiscordModules);
	for (let i = keys.length - 1; i >= 0; i--) {
		const kindKey = keys[i];
		const target = DiscordModules[kindKey];
		const targetKeys = Object.keys(target);
		for (let p = targetKeys.length - 1; p >= 0; p--) {
			const itemKey = targetKeys[p];
			const { filter, options } = target[itemKey];
			res.push(`${itemKey}:getModule(${filter},${options})`);
		}
	}
	return `import { Filters, getModule } from "@Webpack"; export default {${res.join(",\n")}}`
}

const ModulesHandler = {
	resolve(moduleName, type) {
		const { filter, options } = DiscordModules.Modules[moduleName];
		const accessor = type === "Patch" ? "getModuleAndKey" : "getModule";
		const faileSafe = type === "Patch" ? " || {}" : "";
		const isFilter = filter.includes("Filters.") ? "Filters," : "";
		return `import { {{filter}}${accessor} } from "@Webpack"; export default /* @__PURE__ */ 
		(() => ${accessor}(${filter},${options})${faileSafe})();`.replace("{{filter}}", isFilter);
	}
};

const StoresHandler = {
	resolve(moduleName) {
		return `import { getStore } from "@Webpack"; export default /* @__PURE__ */ (() => getStore("${moduleName}"))();`;
	}
};

const EnumsHandler = {
	resolve(moduleName) {
		const { filter, options, fallback } = DiscordModules.Enums[moduleName];
		return `import { Filters, getModule } from "@Webpack"; export default /* @__PURE__ */ (() => getModule(${filter},${options}) || ${JSON.stringify(fallback, null, 4)})();`;
	}
};

const namespace = "MODULES-AUTO-LOADER";
module.exports = function modulesAutoLoader() {
	return {
		name: "modules-auto-loader",
		setup(build) {
			build.onResolve({ filter: regex }, ({ path }) => ({ path, namespace }));
			build.onLoad({ filter: regex, namespace }, ({ path: id }) => {
				const [target, moduleName] = getModuleInfo(id);
				if(moduleName === "all")
					return { contents: getAll(), resolveDir: __dirname }; 
				switch (target) {
					case "Patch":
					case "Modules":
						return { contents: ModulesHandler.resolve(moduleName, target), resolveDir: __dirname };
					case "Stores":
						return { contents: StoresHandler.resolve(moduleName), resolveDir: __dirname };
					case "Enums":
						return { contents: EnumsHandler.resolve(moduleName), resolveDir: __dirname };
				}
			});
		}
	};
};
