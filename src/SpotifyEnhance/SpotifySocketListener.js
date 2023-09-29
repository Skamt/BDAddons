import { Patcher } from "@Api";
import SpotifyStore from "@Stores/SpotifyStore";
import ChangeEmitter from "@Utils/ChangeEmitter";

function getSocketConstructor() {
	const playableComputerDevices = SpotifyStore.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);

	return new Promise(resolve => {
		function listener() {
			const socket = getSocketConstructor();
			if (!socket) return;
			SpotifyStore.removeChangeListener(listener);
			resolve(socket);
		}
		SpotifyStore.addChangeListener(listener);
	});
}

export default new (class SpotifySocketListener extends ChangeEmitter {
	constructor() {
		super();
	}

	async init() {
		const socket = await getSocket();
		if(this.unpatch) this.unpatch();
		this.unpatch = Patcher.after(socket.prototype, "handleEvent", (socket, [event]) => this.emit({ socket, event }));
	}

	dispose() {
		this.unpatch?.();
		delete this.unpatch;
	}
})();
