import ChangeEmitter from "@Utils/ChangeEmitter";
import Timer from "@Utils/Timer";
import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import { promiseHandler } from "@Utils";
import SpotifyStore from "@Stores/SpotifyStore";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import SpotifyAccount from "./SpotifyAccount";

export default new (class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSocketEvent = this.onSocketEvent.bind(this);
		this.onSpotifyStoreChange = this.onSpotifyStoreChange.bind(this);
		this.onAccountsChanged = this.onAccountsChanged.bind(this);
	}

	async init() {
		this.activeAccount = undefined;
		this.timer = new Timer(
			() => {
				console.log("Idle Timeout HIT: ", Date());
				this.activeAccount = undefined;
				this.emit();
			},
			10 * 60 * 1000
		);
		
		SpotifyStore.addChangeListener(this.onSpotifyStoreChange);
		ConnectedAccountsStore.addChangeListener(this.onAccountsChanged);
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.ensureDeviceState();
		if (this.activeAccount.isActive) await this.fetchPlayerState();
		this.emit();
	}

	dispose() {
		SpotifyStore.removeChangeListener(this.onSpotifyStoreChange);
		ConnectedAccountsStore.removeChangeListener(this.onAccountsChanged);
		clearTimeout(this.idleTimeoutId);
		this.timer = null;
		delete this.timer;
		delete this.activeAccount;
	}

	onAccountsChanged() {
		if (!this.activeAccount) return;
		const connectedAccounts = ConnectedAccountsStore.getAccounts().filter(account => account.type === "spotify");
		if (connectedAccounts.some(a => a.id === this.activeAccount.id)) return;

		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (socket) return;
		this.activeAccount = undefined;
		this.setToken();
		this.emit();
	}

	async onSpotifyStoreChange() {
		if (this.activeAccount) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.fetchPlayerState();
		this.emit();
	}

	onSocketEvent({ socket, event }) {
		if (socket.accountId !== this.activeAccount?.id) return;

		switch (event.type) {
			case "PLAYER_STATE_CHANGED":
				this.activeAccount.setPlayerState(event.event.state);
				break;
			case "DEVICE_STATE_CHANGED":
				this.activeAccount.setDevices(event.event.devices);
				break;
		}
		if (!this.activeAccount?.isActive) this.activeAccount = undefined;
		this.checkActivityInterval();
		this.emit();
	}

	checkActivityInterval() {
		if (!this.activeAccount?.playerState) return this.timer.stop();

		const { isPlaying } = this.activeAccount.playerState;

		if (isPlaying) return this.timer.stop();

		if (!isPlaying) return this.timer.start();
	}

	setToken() {
		SpotifyAPIWrapper.updateToken(this.activeAccount?.socket || {});
	}

	async ensureDeviceState() {
		const [err, data] = await promiseHandler(SpotifyAPIWrapper.getDevices());
		if (err) return;
		this.activeAccount.setDevices(data.devices);
	}

	async fetchPlayerState() {
		const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
		if (err) return;
		this.activeAccount.setPlayerState(playerState);
	}

	getActiveAccount() {
		return this.activeAccount;
	}
})();
