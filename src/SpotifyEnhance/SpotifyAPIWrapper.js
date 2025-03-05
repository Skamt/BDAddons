import SpotifyAPI from "@Utils/SpotifyAPI";
import RefreshToken from "@Modules/RefreshToken";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import DB from "./DB";
import { promiseHandler } from "@Utils";
import { parsers } from "./Utils";

async function _requestHandler(action) {
	let repeat = 1;
	do {
		const [actionError, actionResponse] = await promiseHandler(action());
		if (!actionError) return actionResponse;
		if (actionError.status !== 401) throw new Error(actionError.message);

		if (!SpotifyAPI.accountId) throw new Error("Can't refresh expired access token Unknown account ID");

		const [tokenRefreshError, tokenRefreshResponse] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (tokenRefreshError) {
			Logger.error(tokenRefreshError);
			throw "Could not refresh Spotify token";
		}

		SpotifyAPI.token = tokenRefreshResponse.body.access_token;
	} while (repeat--);

	throw new Error("Could not fulfill request");
}

const requestHandler = (() => {
	let awaiterPromise = Promise.resolve();

	return async (...args) => {
		/* Slopy queue, i know */
		const { promise, resolve } = Promise.withResolvers();
		const tempPromise = awaiterPromise;
		awaiterPromise = promise;

		await tempPromise;
		try {
			const res = await _requestHandler(...args);
			resolve();
			return res;
		} catch (e) {
			resolve();
			throw e;
		}
	};
})();

function ressourceActions(prop) {
	const { success, error } = {
		queue: {
			success: (type, name) => `Queued ${name}`,
			error: (type, name, reason) => `Could not queue ${name}\n${reason}`
		},
		listen: {
			success: (type, name) => `Playing ${name}`,
			error: (type, name, reason) => `Could not play ${name}\n${reason}`
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

async function fetchRessource(type, id) {
	const [err, data] = await promiseHandler(requestHandler(() => SpotifyAPI.getRessource(type, id)));
	if (err) return Logger.error(`Could not fetch ${type} ${id}`);
	return data;
}

async function getRessourceWithCache(type, id) {
	/* no fetching if we can't cache */
	if(!DB.db) return; 
	const cachedData = await DB.get(type, id);
	if (cachedData) return cachedData;

	const fetchedData = await fetchRessource(type, id);
	if (!fetchedData) return;

	const parsedData = parsers[type](fetchedData);
	await DB.set(type, parsedData);
	return parsedData;
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
						requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args)).catch(reason => {
							Toast.error(`Could not execute ${prop} command\n${reason}`);
						});
				case "getPlayerState":
				case "getDevices":
					return () => requestHandler(() => SpotifyAPI[prop]());
				case "setAccount":
					return (token, id) => SpotifyAPI.setAccount(token, id);
				case "getRessource":
					return getRessourceWithCache;
			}
		}
	}
);
