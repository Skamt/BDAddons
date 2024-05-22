import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Dispatcher from "@Modules/Dispatcher";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import * as Utils from "@Utils";
import Logger from "@Utils/Logger";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";
import { getModuleAndKey } from "@Webpack";
import { Modules } from "./Modules";
import SettingComponent from "./SettingComponent";
import { Sources } from "./Sources";
import { Stores } from "./Stores";
import webpackRequire from "./webpackRequire";

const Misc = {
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

function init() {
	["Filters", "getModule", "getModules"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;

	window.s = Object.assign(id => Modules.moduleById(id), {
		Utils: {
			ErrorBoundary,
			...Utils
		},
		r: webpackRequire,
		...Misc,
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher,
			TheBigBoyBundle,
			DiscordPermissionsEnum
		}
	});
}

const settings = {
	expEnabled: false
};

const DeveloperExperimentStore = Stores.getStore("DeveloperExperimentStore");
const ExperimentStore = Stores.getStore("ExperimentStore");
const UserStore = Stores.getStore("UserStore").store;

function updateStores() {
	try {
		DeveloperExperimentStore.events.actionHandler.CONNECTION_OPEN();
		ExperimentStore.events.actionHandler.OVERLAY_INITIALIZE({
			user: UserStore.getCurrentUser()
		});
		ExperimentStore.events.storeDidChange();
	} catch {}
}

const enableExp = (() => {
	let unpatch = ()=>{};
	return function enableExp(b) {
		if (!b) {
			unpatch?.();
			UserStore.getCurrentUser().flags = 256;
		} else {
			unpatch = Patcher.after(UserStore, "getCurrentUser", (_, __, ret) => {
				if (!ret) return;
				ret.flags = 1;
			});
		}

		updateStores();
	};
})();

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
		enableExp(false);
	}

	getSettingsPanel() {
		return (
			<SettingComponent
				settings={settings}
				enableExp={enableExp}
			/>
		);
	}
}
