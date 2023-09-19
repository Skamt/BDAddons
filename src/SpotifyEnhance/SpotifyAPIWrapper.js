import SpotifyAPI from "@Utils/SpotifyAPI";
import RefreshToken from "@Modules/RefreshToken";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler } from "@Utils";

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

function playerActions(prop) {
	return (...args) =>
		requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args)).catch(reason => {
			Toast.error(`Could not execute ${prop} command`);
		});
}

function ressourceActions(prop) {
	const { success, error } =
		prop === "queue"
			? {
					success: (type, name) => `Queued ${type} ${name}`,
					error: (type, name, reason) => `Could not queue the ${type} ${name}\n${reason}`
			  }
			: {
					success: (type, name) => `Playing ${type} ${name}`,
					error: (type, name, reason) => `Could not play ${type} ${name}\n${reason}`
			  };

	return (type, id, description) =>
		requestHandler(() => SpotifyAPI[prop](type, id))
			.then(() => {
				Toast.success(success(type, description));
			})
			.catch(reason => {
				Toast.error(error(type, description));
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
				case "next":
				case "previous":
				case "volume":
					return playerActions(prop);
				case "getPlayerState":
				case "getDevices":
					return ()=>requestHandler(() => SpotifyAPI[prop]());
				case "updateToken":
					return socket => {
						SpotifyAPI.token = socket?.accessToken;
						SpotifyAPI.accountId = socket?.accountId;
					};
				default:
					return Promise.reject("Unknown API Command", prop);
					break;
			}
		}
	}
);
