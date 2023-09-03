import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler, copy } from "@Utils";
import { ActionsEnum } from "./consts.js";
import RefreshToken from "@Modules/RefreshToken";

function handleError(msg, error) {
	const e = new Error(msg || "Unknown error", { error });
	Logger.error(e);
	return e;
}

async function requestHandler(action) {
	let repeatOnce = 2;
	while (repeatOnce--) {
		const [err, res] = await promiseHandler(action());
		if (!err) return res;
		if (err.status !== 401) throw handleError(err.message, err);

		if (!SpotifyAPI.accountId) throw "Unknown account ID";
		const [error, response] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (error) throw handleError("Could not refresh Spotify token", error);
		SpotifyAPI.token = response.body.access_token;
	}
}

const actions = {
	queue: {
		track: SpotifyAPI.addTrackToQueue,
		episode: SpotifyAPI.addEpisodeToQueue
	},
	listen: {
		episode: SpotifyAPI.playEpisode,
		album: SpotifyAPI.playAlbum,
		artist: SpotifyAPI.playArtist,
		playlist: SpotifyAPI.playPlaylist,
		track: SpotifyAPI.playTrack
	}
};

function doAction(action, type, ...args) {
	const op = actions[action][type];
	return op ? requestHandler(() => op.apply(SpotifyAPI, args)) : Promise.reject(0);
}

export function queue(type, id, name) {
	doAction("queue", type, id)
		.then(() => {
			Toast.success(`Added ${name} to the queue`);
		})
		.catch(reason => {
			Toast.error(`Could not add ${name} to the queue\n Reason: ${reason}`);
		});
}

export function listen(type, id, name) {
	doAction("listen", type, id)
		.then(() => {
			Toast.success(`Playing ${name}`);
		})
		.catch(reason => {
			Toast.error(`Could not play ${name}\n Reason: ${reason}`);
		});
}

export function seek(ms) {
	requestHandler(() => SpotifyAPI.seek(Math.round(ms)))
		.catch(reason => {
			Toast.error(`Could not seek\n Reason: ${reason}`);
		});
}

export function copySpotifyLink(link) {
	copy(link);
	Toast.success("Link copied!");
}