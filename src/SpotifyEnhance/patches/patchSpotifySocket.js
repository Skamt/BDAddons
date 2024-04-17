import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import DiscordSpotifyStore from "@Stores/SpotifyStore";
import SpotifyStore from "./../SpotifyStore";

function getSocketConstructor() {
	const playableComputerDevices = DiscordSpotifyStore.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);

	return new Promise(resolve => {
		function listener() {
			console.log("getSocket listener");
			const socket = getSocketConstructor();
			if (!socket) return;
			DiscordSpotifyStore.removeChangeListener(listener);
			resolve(socket);
		}
		DiscordSpotifyStore.addChangeListener(listener);
	});
}

export default async function () {
	const socket = await getSocket();
	Patcher.after(socket.prototype, "handleEvent", function onSocketEvent(socket, [socketEvent]) {
		Logger.log("Spotify Socket", socketEvent);
		const state = SpotifyStore.getState();

		if (state.socket.accountId && socket.accountId !== state.socket.accountId) return;
		const { type, event } = socketEvent;

		switch (type) {
			case "PLAYER_STATE_CHANGED": {
				console.log("PLAYER_STATE_CHANGED", event);
				state.setDeviceState(event.state.device.is_active);
				break;
			}
			case "DEVICE_STATE_CHANGED": {
				const devices = event.devices;
				state.setDeviceState(!!(devices.find(d => d.is_active) || devices[0])?.is_active);
				break;
			}
		}
	});
}

