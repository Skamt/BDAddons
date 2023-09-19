import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import Toast from "@Utils/Toast";
import { promiseHandler, copy } from "@Utils";
import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyActiveAccount from "./SpotifyActiveAccount";

const Utils = {
	copySpotifyLink(link) {
		copy(link);
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		window.open(link, "_blank");
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
		this.activeAccount = SpotifyActiveAccount.activeAccount;
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

	getPlayerState(){
		return this.activeAccount;
	}

})();
