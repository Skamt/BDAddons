import Logger from "@Utils/Logger";
import { getModule, getModuleAndKey } from "@Webpack";
import { Module, Source, Store } from "./Types";
import { Modules } from "./Modules";
import { Sources } from "./Sources";
import { Stores } from "./Stores";
import webpackRequire from "./webpackRequire";
import Dispatcher from "@Modules/Dispatcher";

const Misc = {
	getAllAssets() {
		return Object.values(Modules.getModules())
			.filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	byPropValue(val, first = true) {
		return Modules.getModule(
			exports => {
				try {
					return Object.values(exports).some(v => v === val);
				} catch {}
			},
			{ first }
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
			if (graph === null || refresh) graph = Object.keys(Modules.getModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
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
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher
		}
	};
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
		"s" in window && delete window.s;
	}
}
