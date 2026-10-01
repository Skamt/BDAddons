import { findInTree, getInternalInstance } from "@Api";
import Dispatcher from "@Modules/Dispatcher";

export function walkFiber(filter = a => a, depth, el) {
	el ??= $0;
	depth = depth < 1 || !depth ? 1 : depth;

	let fiber = getInternalInstance(el);
	if (!fiber) return console.error("Can't find fiber");
	let res = [];
	while (fiber) {
		let match;
		try {
			if (filter(fiber)) match = fiber;
		} catch {}

		if (match) {
			if (depth === 1) return match;
			res.push(match);
			if (res.length === depth) return res;
		}

		fiber = fiber.return;
	}

	return res;
}

export function getFiber() {
	return getInternalInstance($0);
}

export function dispatcherEventInterceptor(eventName, fn) {
	const index = Dispatcher._interceptors.length;
	Dispatcher.addInterceptor(e => {
		if (e.type !== eventName) return;
		try {
			fn(e);
		} catch {}
	});
	return () => Dispatcher._interceptors.splice(index, 1);
}

export const d = (() => {
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
