import { Modules } from "./Modules";
import Dispatcher from "@Modules/Dispatcher";

// const cssModulesId = [...document.querySelectorAll("link")]
// .filter(a => a.href.endsWith("css"))
// .map(a => a.href.split("/")[4].split(".")[0]).reduce((acc,id) => {
// 	acc = [...acc, ...Object.keys(webpackChunkdiscord_app.find(a => a[0][0] === id)[1])];
// 	return acc;
// },[]);

// const cssLinks = document.querySelectorAll("link");
// const cssModulesId = [];
// for (var i = cssLinks.length - 1; i >= 0; i--) {
// 	const link = cssLinks[i];
// 	if(!link.href.endsWith(".css")) continue;
// 	let [,id] = link.href.match(/\/assets\/(\d+)\./) || [];
// 	if(!id) {
// 		id = link.getAttribute("data-webpack").split('-')[1];
// 		if(!id) continue;
// 	}
// 	// eslint-disable-next-line no-undef
// 	cssModulesId.push(...Object.keys(webpackChunkdiscord_app.find(a => a[0][0] === id)?.[1] || []));
// }


export const Misc = {
	// getAllCssModules(){
	// 	return cssModulesId.map(Modules.moduleById);
	// },
	getAllAssets() {
		return Modules.getModules(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/)).map(a => a.exports);
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
			if (graph === null || refresh) graph = Object.keys(Modules.getWebpackModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
};