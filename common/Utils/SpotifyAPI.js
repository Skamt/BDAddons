import { promiseHandler, buildUrl } from "@Utils";
const API_ENDPOINT = "https://api.spotify.com/v1";

async function responseToJson(response) {
	const [error, data] = await promiseHandler(response.json());
	if (!error) return data;
	return { invalidJson: true, error, response };
}

async function wrappedFetch(url, options) {
	const [error, response] = await promiseHandler(fetch(url, options));
	if (error) throw `Network error, ${error}`;

	if (!response.ok) {
		const result = await responseToJson(response.clone());
		throw (
			result.error || {
				message: "Unknown error",
				status: response.status,
				response
			}
		);
	}

	if (response.status === 204) return true;

	return await responseToJson(response);
}

function buildFetchRequestOptions(builderObj) {
	const options = {
		method: builderObj.method,
		headers: builderObj.headers
	};

	if (builderObj.body) options.body = JSON.stringify(builderObj.body);
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
		this.credentials.token = value;
	}

	get token() {
		return this.credentials.token || null;
	}

	set accountId(value) {
		this.credentials.accountId = value;
	}

	get accountId() {
		return this.credentials.accountId || null;
	}

	getRequestBuilder() {
		return new FetchRequestBuilder(API_ENDPOINT).setToken(this.token);
	}

	next() {
		return this.getRequestBuilder().setPath("/me/player/next").setMethod("POST").build().run();
	}

	previous() {
		return this.getRequestBuilder().setPath("/me/player/previous").setMethod("POST").build().run();
	}

	play() {
		return this.getRequestBuilder().setPath("/me/player/play").setMethod("PUT").build().run();
	}

	pause() {
		return this.getRequestBuilder().setPath("/me/player/pause").setMethod("PUT").build().run();
	}

	seek(ms) {
		return this.getRequestBuilder().setPath("/me/player/seek").setMethod("PUT").setParams({ position_ms: ms }).build().run();
	}

	shuffle(state) {
		return this.getRequestBuilder().setPath("/me/player/shuffle").setMethod("PUT").setParams({ state }).build().run();
	}

	volume(volume_percent) {
		return this.getRequestBuilder().setPath("/me/player/volume").setMethod("PUT").setParams({ volume_percent }).build().run();
	}

	repeat(state) {
		return this.getRequestBuilder().setPath("/me/player/repeat").setMethod("PUT").setParams({ state }).build().run();
	}

	listen(type, id) {
		let body = {};

		if (type === "track" || type === "episode") body = { uris: [`spotify:${type}:${id}`] };
		else body = { context_uri: `spotify:${type}:${id}` };

		return this.getRequestBuilder().setPath("/me/player/play").setMethod("PUT").setBody(body).build().run();
	}

	queue(type, id) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: `spotify:${type}:${id}` })
			.build()
			.run();
	}

	getPlayerState() {
		return this.getRequestBuilder().setPath("/me/player").setMethod("GET").build().run();
	}

	getDevices() {
		return this.getRequestBuilder().setPath("/me/player/devices").setMethod("GET").build().run();
	}

	//...
}

export default new SpotifyClientAPI();
