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
	if (!el) return;
	const instance = getInternalInstance(el);
	if (!instance) return;
	return instance.child;
}

export function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}
