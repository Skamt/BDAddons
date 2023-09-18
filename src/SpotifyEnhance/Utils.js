import {getInternalInstance} from "@Api";
export function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/https?:\/\/open.spotify.com\/(\w+)\/(\w+)/) || [];
	return [type, id];
}

export function getFluxContainer(){
	const el = document.querySelector(".panels-3wFtMD");
	if(!el) return;
	const instance = getInternalInstance(el);
	if(!instance) return;
	return instance.child;
}