import { genUrlParamsFromArray, promiseHandler, buildUrl } from "@Utils";
const API_ENDPOINT = "https://api.spotify.com/v1";

async function responseToJson(response) {
	const failsafeResponse = response.clone();
	const [error, data] = await promiseHandler(response.json());
	if (!error) return data;
	return {
		invalidJson: true,
		data: await failsafeResponse.text()
	};
}

async function wrappedFetch(url, options) {
	const response = await fetch(url, options);

	if (!response.ok)
		switch (response.status) {
			case 400:
			case 401:
			case 403:
			case 404:
			case 429:
			case 503:
				const data = await responseToJson(response);
				throw data.invalidJson ? data.data : data.error;
			default:
				throw response;
		}

	if (response.status === 204) return;
	return await responseToJson(response);
}

function buildFetchRequestOptions(builderObj) {
	const options = {
		method: builderObj.method,
		headers: builderObj.headers
	};

	if (builderObj.body) options["body"] = JSON.stringify(builderObj.body);
	return options;
}

class FetchRequestBuilder {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	setToken(token) {
		this.setHeaders({
			Authorization: `Bearer ${token}`
		});
		return this;
	}

	setPath(path) {
		this.path = path;
		return this;
	}

	setMethod(method) {
		this.method = method;
		return this;
	}

	setParams(params) {
		this.params = params;
		return this;
	}

	setBody(body) {
		this.body = body;
		return this;
	}

	setHeaders(headers) {
		this.headers = Object.assign(this.headers || {}, headers);
		return this;
	}

	getURL() {
		return buildUrl(this.endpoint, this.path, this.params);
	}

	build() {
		this.url = this.getURL();
		this.options = buildFetchRequestOptions(this);
		return this;
	}

	run() {
		return wrappedFetch(this.url, this.options);
	}
}

class SpotifyClientAPI {
	constructor(credentials = {}) {
		this.credentials = credentials;
	}

	set token(value) {
		this.credentials["token"] = value;
	}

	get token() {
		return this.credentials["token"] || null;
	}

	set accountId(value) {
		this.credentials["accountId"] = value;
	}

	get accountId() {
		return this.credentials["accountId"] || null;
	}

	getRequestBuilder() {
		return new FetchRequestBuilder(API_ENDPOINT)
			.setToken(this.token);
	}

	fetchCurrentUserProfile() {
		return this.getRequestBuilder()
			.setPath("/me")
			.setMethod("GET")
			.build()
			.run();
	}

	next() {
		return this.getRequestBuilder()
			.setPath("/me/player/next")
			.setMethod("POST")
			.build()
			.run();
	}

	previous() {
		return this.getRequestBuilder()
			.setPath("/me/player/previous")
			.setMethod("POST")
			.build()
			.run();
	}

	play() {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.build()
			.run();
	}

	pause() {
		return this.getRequestBuilder()
			.setPath("/me/player/pause")
			.setMethod("PUT")
			.build()
			.run();
	}

	seek(ms) {
		return this.getRequestBuilder()
			.setPath("/me/player/seek")
			.setMethod("PUT")
			.setParams({ position_ms: ms })
			.build()
			.run();
	}

	playTrack(trackId) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ uris: [`spotify:track:${trackId}`] })
			.build()
			.run();
	}

	playEpisode(episodeId) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ uris: [`spotify:episode:${episodeId}`] })
			.build()
			.run();
	}

	playPlaylist(playlistId) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: `spotify:playlist:${playlistId}` })
			.build()
			.run();
	}

	playAlbum(albumId) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: `spotify:album:${albumId}` })
			.build()
			.run();
	}

	playArtist(artistId) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: `spotify:artist:${artistId}` })
			.build()
			.run();
	}

	addTrackToQueue(trackId) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: `spotify:track:${trackId}` })
			.build()
			.run();
	}

	addEpisodeToQueue(episodeId) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: `spotify:episode:${episodeId}` })
			.build()
			.run();
	}

	getTrack(trackId) {
		return this.getRequestBuilder()
			.setPath(`/tracks/${trackId}`)
			.setMethod("GET")
			.build()
			.run();
	}

	//...
}

export default new SpotifyClientAPI();