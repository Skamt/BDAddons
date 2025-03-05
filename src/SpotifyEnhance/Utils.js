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

export function isSpotifyUrl(url) {
	try {
		return new URL(url).host === "open.spotify.com";
	} catch {
		return false;
	}
}

const activityPanelClasses = getModule(Filters.byKeys("activityPanel", "panels"), { searchExports: false });

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
		if (userAreaFluxContainer) Promise.resolve(userAreaFluxContainer);

		return new Promise(resolve => {
			const interval = setInterval(() => {
				userAreaFluxContainer = tryGetFluxContainer();
				if (!userAreaFluxContainer) return;
				resolve(userAreaFluxContainer);
				clearInterval(interval);
			}, 500);

			/* Fail safe */
			setTimeout(() => {
				resolve(null);
				clearInterval(interval);
			}, 60 * 1000);
		});
	};
})();


export const parsers = {
	track(obj) {
		return {
			id: obj.id,
			thumbnail: obj.album.images,
			rawTitle: obj.name,
			rawDescription: `${obj.artists.map(a => a.name).join(", ")} · ${obj.name} · ${new Date(obj.album.release_date).getFullYear()}`,
			url: obj.external_urls.spotify,
			preview_url: obj.preview_url,
			explicit: obj.explicit
		};
	},
	playlist(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.name} · ${obj.tracks.total} songs · ${obj.followers.total} likes`,
			followers:obj.followers.total,
			total_tracks:obj.tracks.total,
			owner:{
				name:obj.owner.display_name,
				id:obj.owner.id
			}
		};
	},
	album(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.artists.map(a => a.name).join(", ")} · ${obj.name} · ${obj.total_tracks} songs · ${new Date(obj.release_date).getFullYear()}`,
			total_tracks:obj.total_tracks,
			popularity:obj.popularity,
		};
	},
	artist(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: `${obj.name} · ${obj.followers.total} followers · ${obj.popularity} popularity`,
			url: obj.external_urls.spotify,
			popularity: obj.popularity,
		};
	},
	user(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.display_name,
			rawDescription: `${obj.display_name} · ${obj.followers.total} followers`,
			url: obj.external_urls.spotify,
		};
	},
	show(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: obj.description,
			url: obj.external_urls.spotify,
			media_type: obj.media_type,
			publisher: obj.publisher,
			languages: obj.languages,
			is_externally_hosted: obj.is_externally_hosted,
			total_episodes:obj.total_episodes
		};
	},
	episode(obj) {
		return {
			id: obj.id,
			url: obj.external_urls.spotify,
			preview_url:obj.audio_preview_url,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: obj.description,
			language: obj.language,
			release_date: obj.release_date,
			explicit: obj.explicit,
			duration_ms: obj.duration_ms,
			is_externally_hosted: obj.is_externally_hosted,
		};
	}
};
