import OverridePremiumTypeStore from "@Stores/OverridePremiumTypeStore";
import Dispatcher from "@Modules/Dispatcher";

function onConnectionOpen() {
	const state = OverridePremiumTypeStore.getState();
	if (state.premiumTypeActual !== 2 || state.premiumTypeOverride === 2) return;
	state.premiumTypeOverride = 2;
}

module.exports = () => ({
	start() {
		OverridePremiumTypeStore.getState().premiumTypeOverride = 2;
		Dispatcher.subscribe("CONNECTION_OPEN",onConnectionOpen);

	},
	stop() {
		Dispatcher.unsubscribe("CONNECTION_OPEN",onConnectionOpen);
		OverridePremiumTypeStore.getState().premiumTypeOverride = undefined;
	}
});
