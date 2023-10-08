import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import Toast from "@Utils/Toast";
import { copy } from "@Utils";
import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyActiveAccount from "./SpotifyActiveAccount";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";

const Utils = {
	copySpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		copy(link);
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		window.open(link, "_blank");
	},
	share(link){
		if (!link) return Toast.error("Could not resolve url");
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return Toast.info("There is no Selected Channel");
		sendMessageDirectly({ id }, link).catch(a => {
			Toast.error(a.message);
			insertText(link);
		});
	} 
};

export default new (class SpotifyWrapper extends ChangeEmitter {
	constructor() {
		super();
		this.onStateChange = this.onStateChange.bind(this);
	}

	init() {
		SpotifyActiveAccount.init();
		SpotifyActiveAccount.on(this.onStateChange);
		this.activeAccount = SpotifyActiveAccount.getActiveAccount();
		this.Player = SpotifyAPIWrapper;
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
		this.activeAccount = SpotifyActiveAccount.getActiveAccount();
		console.log("activeAccount", this.activeAccount?.playerState);
		this.emit();
	}

	getDeviceState() {
		return this.activeAccount?.isActive;
	}

	getPlayerState() {
		return this.activeAccount?.playerState;
	}

	getCurrentlyPlaying() {
		if (!this.activeAccount?.playerState?.isPlaying) return;
		return this.activeAccount.playerState.track;
	}

	getCurrentlyPlayingById(id) {
		const currentlyPlaying = this.getCurrentlyPlaying();
		if (!currentlyPlaying) return;
		if (currentlyPlaying.ressourceId !== id) return;
		return currentlyPlaying;
	}

	getSpotifyState() {
		return {
			deviceState: this.getDeviceState(),
			playerState: this.getPlayerState()
		};
	}
})();
