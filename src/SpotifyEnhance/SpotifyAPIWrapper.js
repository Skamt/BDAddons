import SpotifyAPI from "@Utils/SpotifyAPI";
import RefreshToken from "@Modules/RefreshToken";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler } from "@Utils";

function createAndLogError(msg = "Unknown error", cause = "Unknown cause") {
	const e = new Error(msg, { cause });
	Logger.error(e);
	return e;
}

async function requestHandler(action) {
	let repeatOnce = 2;
	while (repeatOnce--) {
		const [actionError, actionResponse] = await promiseHandler(action());
		if (!actionError) return actionResponse;
		if (actionError.status !== 401) throw createAndLogError(actionError.message, actionError);

		if (!SpotifyAPI.accountId) throw createAndLogError("Can't refresh expired access token", "Unknown account ID");

		const [tokenRefreshError, tokenRefreshResponse] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (tokenRefreshError) throw createAndLogError("Could not refresh Spotify token", tokenRefreshError);
		SpotifyAPI.token = tokenRefreshResponse.body.access_token;
	}
}

function playerActions(prop) {
	return (...args) =>
		requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args)).catch(reason => {
			Toast.error(`Could not execute ${prop} command\n${reason}`);
		});
}

function ressourceActions(prop) {
	const { success, error } = {
		queue: {
			success: (type, name) => `Queued ${type} ${name}`,
			error: (type, name, reason) => `Could not queue ${type} ${name}\n${reason}`
		},
		listen: {
			success: (type, name) => `Playing ${type} ${name}`,
			error: (type, name, reason) => `Could not play ${type} ${name}\n${reason}`
		}
	}[prop];

	return (type, id, description) =>
		requestHandler(() => SpotifyAPI[prop](type, id))
			.then(() => {
				Toast.success(success(type, description));
			})
			.catch(reason => {
				Toast.error(error(type, description, reason));
			});
}

export default new Proxy(
	{},
	{
		get(_, prop) {
			switch (prop) {
				case "queue":
				case "listen":
					return ressourceActions(prop);
				case "play":
				case "pause":
				case "shuffle":
				case "repeat":
				case "seek":
				case "next":
				case "previous":
				case "volume":
					return playerActions(prop);
				case "getPlayerState":
				case "getDevices":
					return () => requestHandler(() => SpotifyAPI[prop]());
				case "updateToken":
					return socket => {
						SpotifyAPI.token = socket?.accessToken;
						SpotifyAPI.accountId = socket?.accountId;
					};
				default:
					return Promise.reject("Unknown API Command", prop);
			}
		}
	}
);
