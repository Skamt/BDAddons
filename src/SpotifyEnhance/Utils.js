export  function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, resourceId] = url.match(/https?:\/\/open.spotify.com\/(\w+)\/(\w+)/) || [];
	return { type, resourceId };
}