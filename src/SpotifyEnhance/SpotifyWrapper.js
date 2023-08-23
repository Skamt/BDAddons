import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { copy } from "@Utils";

const refreshToken = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

async function requestHandler({ action, onSucess, onError }) {
	let b = false;
	while (true) {
		try {
			await action();
			onSucess();
			break;
		} catch (err) {
			if (err?.status !== 401 || b) {
				Logger.error(err);
				return onError();
			}
			b = true;
			const data = await refreshToken(SpotifyAPI.accountId);
			if (!data.ok) break;
			SpotifyAPI.token = data.body.access_token;
		}
	}
}

export function copySpotifyLink(link) {
	copy(link);
	Toast.success("Link copied!");
}

const listenActions = {
	episode: id => SpotifyAPI.playEpisode(id),
	album: id => SpotifyAPI.playAlbum(id),
	artist: id => SpotifyAPI.playArtist(id),
	playlist: id => SpotifyAPI.playPlaylist(id),
	track: id => SpotifyAPI.playTrack(id)
};

const addToQueueActions = {
	track: id => SpotifyAPI.addTrackToQueue(id),
	episode: id => SpotifyAPI.addEpisodeToQueue(id)
};

function nop(id) {
	throw id;
}

export function listen(type, id, data) {
	const action = listenActions[type] || nop;

	requestHandler({
		action: () => action(id),
		onSucess: () => Toast.success(`Playing ${data || id}`),
		onError: () => Toast.error(`Could not play ${data || trackId}`)
	});
}

export function addToQueue(type, id, data) {
	const action = addToQueueActions[type] || nop;

	requestHandler({
		action: () => action(id),
		onSucess: () => Toast.success(`Added ${data || trackId} to the queue`),
		onError: () => Toast.error(`Could not add ${data || trackId} to the queue`)
	});
}
