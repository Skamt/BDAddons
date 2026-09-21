import { findInTree, getInternalInstance } from "@Api";
import { Filters, getModule } from "@Webpack";
import { openLink, copy, getPathName } from "@Utils";
import Store from "@/store";
import React from "@React";
import { insertText, sendMessageDirectly } from "@Utils/Messages";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import Toast from "@Utils/Toast";

export function spotifyCopy(content) {
	if (!content) return Toast.error("Copy failed!");
	copy(content);
	Toast.success("Copied!");
}

export const copySpotifyUrl = url => spotifyCopy(sanitizeSpotifyLink(url))
export const openSpotifyUrl = url => openLink(sanitizeSpotifyLink(url))

export function spotifyShare(content) {
	if (!content) return Toast.error("Share failed");
	const id = SelectedChannelStore.getCurrentlySelectedChannelId();
	if (!id) return Toast.info("There is no Selected Channel");

	sendMessageDirectly(content, id).catch((a) => {
		insertText(content);
	});
}


export function parseSpotifyUrl(url) {
	const path = getPathName(url);
	if (!path) return undefined;
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

const activityPanelClasses = getModule(Filters.byKeys("activityPanel", "panels"), {
	searchExports: false,
});

export function useGetRessource(type, id) {
	const [state, setState] = React.useState(null);
	React.useEffect(() => {
		(async () => {
			const data = await Store.Api.getRessource(type, id);
			if (data) setState(data);
		})();
	}, []);
	return state;
}

export const parsers = {
	track(obj) {
		return {
			id: obj.id,
			thumbnail: obj.album.images,
			rawTitle: obj.name,
			rawDescription: `${obj.artists.map((a) => a.name).join(", ")} · ${obj.name} · ${new Date(obj.album.release_date).getFullYear()}`,
			url: obj.external_urls.spotify,
			preview_url: obj.preview_url,
			explicit: obj.explicit,
		};
	},
	playlist(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.name} · ${obj.tracks.total} songs · ${obj.followers.total} likes`,
			followers: obj.followers.total,
			total_tracks: obj.tracks.total,
			owner: {
				name: obj.owner.display_name,
				id: obj.owner.id,
			},
		};
	},
	album(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.artists.map((a) => a.name).join(", ")} · ${obj.name} · ${obj.total_tracks} songs · ${new Date(obj.release_date).getFullYear()}`,
			total_tracks: obj.total_tracks,
			popularity: obj.popularity,
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
			total_episodes: obj.total_episodes,
		};
	},
	episode(obj) {
		return {
			id: obj.id,
			url: obj.external_urls.spotify,
			preview_url: obj.audio_preview_url,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: obj.description,
			language: obj.language,
			release_date: obj.release_date,
			explicit: obj.explicit,
			duration_ms: obj.duration_ms,
			is_externally_hosted: obj.is_externally_hosted,
		};
	},
};
