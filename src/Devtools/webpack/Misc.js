import { Stores } from "./Stores";
import { Modules } from "./Modules";
import Dispatcher from "@Modules/Dispatcher";

export const Misc = {
	getAllAssets() {
		return Modules.getModules(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/)).map(a => a.exports);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher._actionHandlers._nodes;
		const subs = Dispatcher._subscriptions;
		return {
			listeners: subs[eventName],
			stores: [...nodes.values()]
				.map(
					a =>
						a.actionHandler[eventName] &&
						Object.assign(
							{
								get store() {
									return Stores.getStore(a.name);
								}
							},
							a
						)
				)
				.filter(Boolean)
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher._actionHandlers._nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: [...nodes.values()]
				.filter(a => Object.keys(a.actionHandler).some(key => key.toLowerCase().includes(str)))
				.map(a =>
					Object.assign(
						{
							get store() {
								return Stores.getStore(a.name);
							}
						},
						a
					)
				),
			subs: Object.entries(subs)
				.filter(([key]) => key.toLowerCase().includes(str))
				.map(a => a)
		};
	},
	getGraph: (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getCache()).map(a => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
};
