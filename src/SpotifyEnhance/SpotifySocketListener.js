import { Patcher } from "@Api";
import SpotifyStore from "@Stores/SpotifyStore";
import ChangeEmitter from "@Utils/ChangeEmitter";

function getSocketConstructor() {
	const { accounts } = SpotifyStore.__getLocalVars() || { accounts: {} };
	const accountsArr = Object.values(accounts);
	if (!accountsArr) return;
	const socket = accountsArr[0];
	if (!socket) return;

	return socket.constructor;
}

const getSocket = (() => {
	let socketConstructor = null;
	return function getSocket() {
		if (socketConstructor) return Promise.resolve(socketConstructor);
		const socket = getSocketConstructor();
		if (socket) return Promise.resolve((socketConstructor = socket));

		return new Promise(resolve => {
			function listener() {
				const socket = getSocketConstructor();
				if (!socket) return;
				SpotifyStore.removeChangeListener(listener);
				resolve((socketConstructor = socket));
			}
			SpotifyStore.addChangeListener(listener);
		});
	};
})();

export default new (class SpotifySocketListener extends ChangeEmitter {
	constructor() {
		super();
	}

	async init() {
		const socket = await getSocket();
		this.unpatch = Patcher.after(socket.prototype, "handleEvent", (socket, [event]) => {
			this.emit({ socket, event });
		});
	}

	dispose() {
		this.unpatch();
		delete this.unpatch;
	}
})();
