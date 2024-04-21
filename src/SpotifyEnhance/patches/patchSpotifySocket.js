import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";
import { Store } from "../Store";

function getSocketConstructor() {
	const playableComputerDevices = SpotifyStore.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);

	return new Promise(resolve => {
		function listener() {
			try {
				const socket = getSocketConstructor();
				if (!socket) return;
				SpotifyStore.removeChangeListener(listener);
				resolve(socket);
			} catch (e) {
				Logger.error(e);
			}
		}
		SpotifyStore.addChangeListener(listener);
	});
}

export default async function () {
	const socket = await getSocket();
	Patcher.after(socket.prototype, "handleEvent", function onSocketEvent(socket, [socketEvent]) {
		Logger.log("Spotify Socket", socketEvent , Date.now());
		const state = Store.getState();

		if (state.account?.accountId && socket.accountId !== state.account?.accountId) return;
		const { type, event } = socketEvent;

		switch (type) {
			case "PLAYER_STATE_CHANGED":
				state.setPlayerState(event.state);
				break;
			case "DEVICE_STATE_CHANGED": {
				const devices = event.devices;
				state.setDeviceState(!!(devices.find(d => d.is_active) || devices[0])?.is_active);
				break;
			}
		}
	});
}
