import { findInTree, getInternalInstance } from "@Api";
import { Filters, getModule } from "@Webpack";

function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

export function parseSpotifyUrl(url) {
	const path = getPathName(url);
	if (typeof url !== "string" || !path) return undefined;
	const urlFrags = path.split("/");
	return [urlFrags.pop(), urlFrags.pop()];
}

export function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}

const activityPanelClasses = getModule(Filters.byProps("activityPanel", "panels"), { searchExports: false });

export const getFluxContainer = (() => {
	let userAreaFluxContainer = undefined;

	function tryGetFluxContainer() {
		const el = document.querySelector(`.${activityPanelClasses.panels}`);
		if (!el) return;
		const instance = getInternalInstance(el);
		if (!instance) return;
		const res = findInTree(instance, a => a?.type?.prototype?.hasParty, { walkable: ["child", "sibling"] });
		if (!res) return;
		return res;
	}

	return () => {
		if (userAreaFluxContainer) return Promise.resolve(userAreaFluxContainer);
		userAreaFluxContainer = tryGetFluxContainer();
		if(userAreaFluxContainer) Promise.resolve(userAreaFluxContainer);
		
		return new Promise(resolve => {
			const interval = setInterval(() => {
				userAreaFluxContainer = tryGetFluxContainer();
				if(!userAreaFluxContainer) return;
				resolve(userAreaFluxContainer);
				clearInterval(interval);
			}, 500);

			/* Fail safe */
			setTimeout(() => {
				resolve(null);
				clearInterval(interval);
			}, 20 * 1000);
		});
	};
})();
