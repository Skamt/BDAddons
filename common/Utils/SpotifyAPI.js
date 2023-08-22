import { genUrlParamsFromArray, buildUrl } from "@Utils";
const API_ENDPOINT = "https://api.spotify.com/v1";

async function wrappedFetch(url, options) {
	const response = await fetch(url, options);

	if (response.ok) {
		const failsafeResponse = response.clone();
		try {
			return await response.json();
		} catch {
			return {
				invalidJson: true,
				data: await failsafeResponse.text()
			};
		}
	}
	switch (response.status) {
		case 401:
		case 403:
		case 429:
			const err = await response.json();
			throw err.error ? err.error : err;
		default:
			throw response;
	}
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

	playTrack(trackUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ uris: [trackUri] })
			.build()
			.run();
	}

	playEpisode(episodeUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ uris: [episodeUri] })
			.build()
			.run();
	}

	playPlaylist(playlistUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: playlistUri })
			.build()
			.run();
	}

	playAlbum(albumUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: albumUri })
			.build()
			.run();
	}

	playArtist(artistUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody({ context_uri: artistUri })
			.build()
			.run();
	}


	addTrackToQueue(trackUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: trackUri })
			.build()
			.run();
	}

	addEpisodeToQueue(episodeUri) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: episodeUri })
			.build()
			.run();
	}

	//...
}

export default new SpotifyClientAPI();