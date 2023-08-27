import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler, copy } from "@Utils";
import { ActionsEnum } from "./consts.js";
import RefreshToken from "@Modules/RefreshToken";

async function requestHandler(action) {
	let repeatOnce = false;
	while (true) {
		try {
			return await action();
		} catch (err) {
			if (repeatOnce) throw err;
			repeatOnce = true;
			if (err.status === 401) {
				const [error, response] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
				if (error || !response.ok) {
					Logger.error("Could not refresh Spotify token", error.body);
					throw error;
				}
				SpotifyAPI.token = response.body.access_token;
				continue;
			}
			if (err.status === 403 || err.status === 429) {
				Logger.error(err.message);
				throw err;
			}
			throw err;
		}
	}
}

export function copySpotifyLink(link) {
	copy(link);
	Toast.success("Link copied!");
}

const actions = {
	[ActionsEnum.LISTEN]: {
		episode: SpotifyAPI.playEpisode,
		album: SpotifyAPI.playAlbum,
		artist: SpotifyAPI.playArtist,
		playlist: SpotifyAPI.playPlaylist,
		track: SpotifyAPI.playTrack
	},
	[ActionsEnum.QUEUE]: {
		track: SpotifyAPI.addTrackToQueue,
		episode: SpotifyAPI.addEpisodeToQueue
	}
};

export function doAction(action, type, ...args) {
	const operation = actions[action]?.[type];
	if (!operation) return Promise.reject(0);
	return requestHandler(() => operation.apply(SpotifyAPI, args));
}