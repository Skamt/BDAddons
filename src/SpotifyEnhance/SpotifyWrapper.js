import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";

const refreshToken = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

async function requestHandler({ action, onSucess, onError }) {
	let b = false;
	while (true) {
		try {
			await action();
			onSucess();
			break;
		} catch (err) {
			if (err?.error?.status !== 401 || b) {
				Logger.error(JSON.stringify(err));
				return onError();
			}
			const data = await refreshToken(SpotifyAPI.accountId);
			if (!data.ok) break;
			SpotifyAPI.token = data.body.access_token;
		} finally {
			b = true;
		}
	}
}

export function addTrackToQueue(trackId) {
	requestHandler({
		action: () => SpotifyAPI.addToQueue(`spotify:track:${trackId}`),
		onSucess: () => Toast.success(`Added [${trackId}] to queue`),
		onError: () => Toast.error(`Could not add [${trackId}] to queue`)
	});
}

export function playTrack(trackId) {
	requestHandler({
		action: () => SpotifyAPI.playTrack([`spotify:track:${trackId}`]),
		onSucess: () => Toast.success(`Playing [${trackId}]`),
		onError: () => Toast.error(`Could not play [${trackId}]`)
	});
}

export function playPlaylist(playlistId) {
	requestHandler({
		action: () => SpotifyAPI.playTrack([`spotify:playlist:${playlistId}`]),
		onSucess: () => Toast.success(`Playing [${playlistId}]`),
		onError: () => Toast.error(`Could not play [${playlistId}]`)
	});
}