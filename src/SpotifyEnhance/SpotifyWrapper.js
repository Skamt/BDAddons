import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler, copy } from "@Utils";
import RefreshToken from "@Modules/RefreshToken";

import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyActiveAccount from "./SpotifyActiveAccount";

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
		SpotifyActiveAccount.updateToken(response.body.access_token);
	}
}

const Utils = {
	copySpotifyLink(link) {
		copy(link);
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		window.open(link, "_blank");
	}
};

function getter(_, prop) {
	return (type, id, name) =>
		requestHandler(() => SpotifyAPI[prop](type, id))
			.then(() => {
				Toast.success(`${prop} ${type} ${name}`);
			})
			.catch(reason => {
				Toast.error(`Could not ${prop} ${name || ""}\n ${reason}`);
			});
}

export default new (class SpotifyWrapper extends ChangeEmitter {
	constructor() {
		super();
		this.onStateChange = this.onStateChange.bind(this);
		
	}

	init() {
		SpotifyActiveAccount.init();
		SpotifyActiveAccount.on(this.onStateChange);
		this.activeAccount = SpotifyActiveAccount.activeAccount;
		this.Player = new Proxy({}, { get: getter });
		this.Utils = Utils;
	}

	dispose() {
		SpotifyActiveAccount.dispose();
		SpotifyActiveAccount.off(this.onStateChange);
		delete this.activeAccount;
		delete this.Player;
		delete this.Utils;
	}

	onStateChange() {
		this.activeAccount = SpotifyActiveAccount.activeAccount;
		console.log("activeAccount", this.activeAccount);
		this.emit();
	}


	getPlayerState() {
		if (!this.activeAccount) return;
		return this.activeAccount.playerState;
	}

	getDeviceState() {
		if (!this.activeAccount) return;
		return this.activeAccount.isActive;
	}

	getCurrentlyPlaying(){
		if (!this.activeAccount) return ;
		if(!this.activeAccount.isPlaying) return;
		return this.activeAccount.item;
	}

	getCurrentlyPlayingById(id){
		const currentlyPlaying = this.getCurrentlyPlaying();
		if(!currentlyPlaying) return;
		if(currentlyPlaying.id !== id) return;
		return currentlyPlaying;		
	}

})();
