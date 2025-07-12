import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";
import { Store } from "@/Store";
import Plugin, { Events } from "@Utils/Plugin";

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

Plugin.on(Events.START, async () => {
	const socket = await getSocket();

	const unpatch = Patcher.after(socket.prototype, "handleEvent", function onSocketEvent(socket, [socketEvent]) {
		/*DEBUG*/
		Logger.log("Spotify Socket", socketEvent, Date.now());
		/*DEBUG*/

		if (Store.state.account?.accountId && socket.accountId !== Store.state.account?.accountId) return;
		const { type, event } = socketEvent;

		switch (type) {
			case "PLAYER_STATE_CHANGED":
				Store.state.setPlayerState(event.state);
				break;
			case "DEVICE_STATE_CHANGED": {
				const devices = event.devices;
				const isActive = !!(devices.find(d => d.is_active) || devices[0])?.is_active;
				Store.state.setDeviceState(isActive);
				if (!isActive) Store.state.setPlayerState({});
				break;
			}
		}
	});

	Plugin.once(Events.STOP, unpatch);
});
