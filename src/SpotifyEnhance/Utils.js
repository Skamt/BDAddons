import { getInternalInstance } from "@Api";
import { Filters, getModule } from "@Webpack";

const activityPanelClasses = getModule(Filters.byProps("activityPanel", "panels"), { searchExports: false });

export function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/https?:\/\/open.spotify.com\/(\w+)\/(\w+)/) || [];
	return [type, id];
}

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

export function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}
