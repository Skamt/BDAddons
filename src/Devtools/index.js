import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Dispatcher from "@Modules/Dispatcher";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import * as Utils from "@Utils";
import Logger from "@Utils/Logger";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";
import { getModuleAndKey } from "@Webpack";
import { Modules } from "./Modules";
import { Misc } from "./Misc";
import SettingComponent from "./SettingComponent";
import { Sources } from "./Sources";
import { Stores } from "./Stores";
import webpackRequire from "./webpackRequire";



const d = (() => {
	const cache = new WeakMap();
	const emptyDoc = document.createDocumentFragment();

	function isValidCSSSelector(selector) {
		try {
			emptyDoc.querySelector(selector);
		} catch {
			return false;
		}
		return true;
	}

	function getElement(target) {
		if (typeof target === "string" && isValidCSSSelector(target)) return document.querySelector(target);

		if (target instanceof HTMLElement) return target;

		return undefined;
	}

	function getCssRules(el) {
		const output = {};
		for (let i = 0; i < document.styleSheets.length; i++) {
			const stylesheet = document.styleSheets[i];
			const { rules } = stylesheet;
			const ID = stylesheet.href || stylesheet.ownerNode.id || i;
			output[ID] = {};
			// biome-ignore lint/complexity/noForEach: <explanation>
			el.classList.forEach(c => {
				output[ID][c] = [];
				for (let j = 0; j < rules.length; j++) {
					const rule = rules[j];
					if (rule.cssText.includes(c)) output[ID][c].push(rule);
				}
				if (output[ID][c].length === 0) delete output[ID][c];
			});
			if (Object.keys(output[ID]).length === 0) delete output[ID];
		}
		return output;
	}

	function getCssRulesForElement(target, noCache) {
		const el = getElement(target);

		if (!el) return;

		if (!noCache && cache.has(el)) return cache.get(el);

		const data = getCssRules(el);
		cache.set(el, data);
		return data;
	}

	// get scroller styles for an element
	function scrollerStylesForElement(el) {
		const output = [];
		const styles = getCssRulesForElement(el);
		for (const cssStyleRules of Object.values(styles)) {
			for (const rules of Object.values(cssStyleRules)) {
				for (let i = 0; i < rules.length; i++) {
					const rule = rules[i];
					if (rule.selectorText?.includes("-webkit-scrollbar")) output.push(rule);
				}
			}
		}
		return output;
	}

	return {
		getCssRulesForElement,
		scrollerStylesForElement
	};
})();

function init() {
	["Filters", "getModule", "getModules"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;

	window.s = Object.assign(id => Modules.moduleById(id), {
		Utils: {
			ErrorBoundary,
			...Utils,
			...d
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
