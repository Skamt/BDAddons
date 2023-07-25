import Logger from "@Utils/Logger";
import { getModule, getModuleAndKey } from "@Webpack";
import { Module, Source, Store } from "./Types";
import Modules from "./Modules";
import Sources from "./Sources";
import Stores from "./Stores";
import webpackRequire from "./webpackRequire"
import Dispatcher from "@Modules/Dispatcher";





const Common = {
	getModuleAndSourceById(moduleId) {
		return {
			id: moduleId,
			source: Sources.sourceById(moduleId),
			module: Modules.moduleById(moduleId)
		};
	},
	getAllById(moduleId) {
		return {
			get target() {
				return Common.getModuleAndSourceById(moduleId);
			},
			get modulesImportedInTarget() {
				return Modules.modulesImportedInModuleById(moduleId).map(Common.getModuleAndSourceById);
			},
			get modulesImportingTarget() {
				return Modules.modulesImportingModuleById(moduleId).map(Common.getModuleAndSourceById);
			}
		};
	},
	getAllByFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getAllById);
		return Common.getAllById(result);
	},
	getModuleAndSourceByExportsFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getModuleAndSourceById);
		return Common.getModuleAndSourceById(result);
	}
};

const Misc = {
	getAllAssets() {
		return Object.values(Modules.getModules())
			.filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	byPropValue(val, first = true) {
		return Modules.unsafe_getModule(
			m => {
				try {
					return Object.values(m).some(v => v === val);
				} catch {
					return false;
				}
			}, { first }
		);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes)
				.map(a => a.actionHandler[eventName] && a)
				.filter(Boolean),
			subs: [eventName, subs[eventName]]
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes).filter(a => Object.keys(a.actionHandler).some(key => key.toLowerCase().includes(str))),
			subs: Object.entries(subs)
				.filter(([key]) => key.toLowerCase().includes(str))
				.map(a => a)
		};
	},
	getGraph: (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModule(a) }));
			return graph;
		};
	})()
};

function init() {
	["Filters", "getModule"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;
	window.s = {
		r: webpackRequire,
		...Misc,
		...Common,
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher
		}
	};
}

function clean() {
	delete window.s;
}

export default class Devtools {
	start() {
		try {
			init();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		clean()
	}
}