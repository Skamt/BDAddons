import SpotifyAPI from "@Utils/SpotifyAPI";
import RefreshToken from "@Modules/RefreshToken";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler } from "@Utils";

async function requestHandler(action) {
	let repeat = 2;
	while (repeat--) {
		const [actionError, actionResponse] = await promiseHandler(action());
		if (!actionError) return actionResponse;
		if (actionError.status !== 401) {
			Logger.error(actionError);
			throw actionError;
		}

		if (!SpotifyAPI.accountId) throw "Can't refresh expired access token Unknown account ID";

		const [tokenRefreshError, tokenRefreshResponse] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (tokenRefreshError) {
			Logger.error(tokenRefreshError);
			throw "Could not refresh Spotify token";
		}
		SpotifyAPI.token = tokenRefreshResponse.body.access_token;
	}
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
				Toast.error(error(type, description, reason.message));
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
					return (...args) =>
						requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args))
						.catch(reason => {
							Toast.error(`Could not execute ${prop} command\n${reason.message}`);
						});
				case "getPlayerState":
				case "getDevices":
					return () => requestHandler(() => SpotifyAPI[prop]());
				case "setToken":
					return socket => {
						SpotifyAPI.token = socket?.accessToken;
						SpotifyAPI.accountId = socket?.accountId;
					};
				default:
					return undefined;
			}
		}
	}
);
