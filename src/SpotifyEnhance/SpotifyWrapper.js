import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { copy } from "@Utils";
import { ActionsEnum } from "./consts.js";

const refreshToken = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

async function requestHandler(action) {
	let repeatOnce = false;
	while (true) {
		try {
			return await action();
		} catch (err) {
			/**
			 * 401 = expired token, so we refresh it
			 * if not we simply break out
			 * other errors are not our concern
			 **/
			if (err?.status !== 401 || repeatOnce) {
				Logger.error(err);
				throw err;
			}
			repeatOnce = true;
			const response = await refreshToken(SpotifyAPI.accountId);
			if (!response.ok) {
				Logger.error(response);
				throw response;
			}
			SpotifyAPI.token = response.body.access_token;
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
	},
	[ActionsEnum.FETCH]: {
		track: SpotifyAPI.getTrack
	}
};

export function doAction(action, type, ...args) {
	const operation = actions[action]?.[type];
	if (!operation) return Promise.reject(0);
	return requestHandler(() => operation.apply(SpotifyAPI, args));
}
