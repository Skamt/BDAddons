import SpotifyAPI from "@Utils/SpotifyAPI";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { promiseHandler, copy } from "@Utils";
import { ActionsEnum } from "./consts.js";
import RefreshToken from "@Modules/RefreshToken";

import EventEmitter from "./EventEmitter";
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
		SpotifyAPI.token = response.body.access_token;
	}
}

// export function queue(type, id, name) {
// 	doAction("queue", type, id)
// 		.then(() => {
// 			Toast.success(`Added ${name} to the queue`);
// 		})
// 		.catch(reason => {
// 			Toast.error(`Could not add ${name} to the queue\n Reason: ${reason}`);
// 		});
// }

// export function listen(type, id, name) {
// 	doAction("listen", type, id);
// }

// export function seek(ms) {
// 	requestHandler(() => SpotifyAPI.seek(Math.round(ms))).catch(reason => {
// 		Toast.error(`Could not seek\n Reason: ${reason}`);
// 	});
// }



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

export default new (class SpotifyWrapper extends EventEmitter {
	constructor() {
		super();
		this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
		this.onDeviceStateChange = this.onDeviceStateChange.bind(this);
		this.onPlayerAndDeviceStateChange = this.onPlayerAndDeviceStateChange.bind(this);
	}

	init() {
		SpotifyActiveAccount.init();
		SpotifyActiveAccount.on("BOTH", this.onPlayerAndDeviceStateChange);
		SpotifyActiveAccount.on("PLAYER", this.onPlayerStateChange);
		SpotifyActiveAccount.on("DEVICE", this.onDeviceStateChange);
		this.activeAccount = SpotifyActiveAccount.activeAccount;
		this.Player = new Proxy({}, { get: getter });
		this.Utils = Utils;
	}

	dispose() {
		SpotifyActiveAccount.dispose();
		SpotifyActiveAccount.off("BOTH", this.onPlayerAndDeviceStateChange);
		SpotifyActiveAccount.off("PLAYER", this.onPlayerStateChange);
		SpotifyActiveAccount.off("DEVICE", this.onDeviceStateChange);
		delete this.activeAccount;
		delete this.Player;
		delete this.Utils;
	}

	update() {
		this.activeAccount = SpotifyActiveAccount.activeAccount;
	}

	onPlayerStateChange() {
		this.update();
		this.emit("PLAYER");
	}

	onDeviceStateChange() {
		this.update();
		this.emit("DEVICE");
	}

	onPlayerAndDeviceStateChange() {
		this.update();
		this.emit("DEVICE");
		this.emit("PLAYER");
		console.log("deviceState", this.activeAccount?.deviceState, "playerState", this.activeAccount?.playerState);
	}

	getPlayerState() {
		if (!this.activeAccount) return undefined;
		return this.activeAccount.playerState;
	}

	getDeviceState() {
		if (!this.activeAccount) return undefined;
		return this.activeAccount.deviceState;
	}
})();
