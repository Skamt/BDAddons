import ChangeEmitter from "@Utils/ChangeEmitter";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";

export default new (class SpotifyConnectionsListener extends ChangeEmitter {
	constructor() {
		super();
		this.listener = this.listener.bind(this);
	}

	init() {
		ConnectedAccountsStore.addChangeListener(this.listener);
		this.connectedAccounts = this.getAccounts().length;
	}

	dispose() {
		ConnectedAccountsStore.removeChangeListener(this.listener);
		delete this.connectedAccounts;
	}

	listener() {
		const spotifyAccounts = this.getAccounts();
		if (spotifyAccounts.length === this.connectedAccounts) return;
		this.connectedAccounts = spotifyAccounts.length;

		this.emit();
	}

	getAccounts() {
		const connectedAccounts = ConnectedAccountsStore.getAccounts();
		return connectedAccounts.filter(account => account.type === "spotify");
	}
})();
