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
		action: () => SpotifyAPI.addTrackToQueue(`spotify:track:${trackId}`),
		onSucess: () => Toast.success(`Added [${trackId}] to queue`),
		onError: () => Toast.error(`Could not add [${trackId}] to queue`)
	});
}

export function addEpisodeToQueue(episodeId) {
	requestHandler({
		action: () => SpotifyAPI.addTrackToQueue(`spotify:episode:${episodeId}`),
		onSucess: () => Toast.success(`Added [${episodeId}] to queue`),
		onError: () => Toast.error(`Could not add [${episodeId}] to queue`)
	});
}

export function playTrack(trackId) {
	requestHandler({
		action: () => SpotifyAPI.playTrack(`spotify:track:${trackId}`),
		onSucess: () => Toast.success(`Playing [${trackId}]`),
		onError: () => Toast.error(`Could not play [${trackId}]`)
	});
}

export function playPlaylist(playlistId) {
	requestHandler({
		action: () => SpotifyAPI.playPlaylist(`spotify:playlist:${playlistId}`),
		onSucess: () => Toast.success(`Playing [${playlistId}]`),
		onError: () => Toast.error(`Could not play [${playlistId}]`)
	});
}

export function playArtist(artistId) {
	requestHandler({
		action: () => SpotifyAPI.playArtist(`spotify:artist:${artistId}`),
		onSucess: () => Toast.success(`Playing [${artistId}]`),
		onError: () => Toast.error(`Could not play [${artistId}]`)
	});
}

export function playAlbum(albumId) {
	requestHandler({
		action: () => SpotifyAPI.playAlbum(`spotify:album:${albumId}`),
		onSucess: () => Toast.success(`Playing [${albumId}]`),
		onError: () => Toast.error(`Could not play [${albumId}]`)
	});
}

export function playEpisode(episodeId) {
	requestHandler({
		action: () => SpotifyAPI.playEpisode(`spotify:episode:${episodeId}`),
		onSucess: () => Toast.success(`Playing [${episodeId}]`),
		onError: () => Toast.error(`Could not play [${episodeId}]`)
	});
}

export function copySpotifyLink(link) {
	copy(link);
	Toast.success("Link copied!");
}