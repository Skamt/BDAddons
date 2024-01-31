import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import Toast from "@Utils/Toast";
import { copy } from "@Utils";
import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyActiveAccount from "./SpotifyActiveAccount";
import { sanitizeSpotifyLink } from "./Utils";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";

const Utils = {
	copySpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		copy(sanitizeSpotifyLink(link));
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		window.open(sanitizeSpotifyLink(link), "_blank");
	},
	share(link) {
		if (!link) return Toast.error("Could not resolve url");
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return Toast.info("There is no Selected Channel");
		link = sanitizeSpotifyLink(link);
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
		const newState = SpotifyActiveAccount.getActiveAccount();
		if (newState?.playerState?.currentlyPlayingType === "ad") return;
		this.activeAccount = newState;
		console.log("activeAccount", this.activeAccount);
		this.emit();
	}

	getTrack(id) {
		const track = this.activeAccount?.playerState?.track;
		if (!track) return;
		if (!id) return track;
		if (id && id === track.id) return track;
	}

	getActiveState() {
		return this.activeAccount?.isActive;
	}

	getPlayerState(){
		return this.activeAccount?.playerState;
	}

	getEmbedData(id){
		const track = this.activeAccount?.playerState?.track;
		const isPlaying = this.activeAccount?.playerState?.isPlaying;
		if (id !== track?.id) return;
		if (isPlaying) return true;
	}

	getSpotifyState() {
		return {
			deviceState: this.activeAccount?.isActive,
			playerState: this.activeAccount?.playerState
		};
	}
})();
