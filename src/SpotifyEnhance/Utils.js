import { getInternalInstance } from "@Api";
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

export function getFluxContainer() {
	const el = document.querySelector(`.${activityPanelClasses.panels}`);
	if (el) {
		const instance = getInternalInstance(el);
		if (instance) return Promise.resolve(instance.child.sibling);
	}
	return new Promise(resolve => {
		const interval = setInterval(() => {
			const el = document.querySelector(`.${activityPanelClasses.panels}`);
			if (!el) return;
			const instance = getInternalInstance(el);
			if (!instance) return;
			resolve(instance.child.sibling);
			clearInterval(interval);
		}, 500);

		setTimeout(() => {
			resolve(null);
			clearInterval(interval);
		}, 20 * 1000);
	});
}
