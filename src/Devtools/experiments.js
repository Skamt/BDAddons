import Settings from "@Settings";
import Plugin from "@common/Plugin";
import webpack from "./webpack";

const UserStore = webpack.getStore("UserStore")?.store;
const DeveloperExperimentStore = webpack.getStore("DeveloperExperimentStore");

let flag = null;
let userId = null;
function patchUser() {
	if (!UserStore) return;
	const user = UserStore.getCurrentUser();
	if(!user) return;
	if (userId !== user.id) {
		userId = user.id;
		flag = user.flags;
	}
	user.flags = 1;
	updateDeveloperExperimentStore();
}

function unpatchUser() {
	if (!UserStore) return;
	const user = UserStore.getCurrentUser();
	if(!user) return;
	user.flags = flag;
	flag = userId = null;
}

function updateDeveloperExperimentStore() {
	DeveloperExperimentStore?.events?.events?.actionHandler?.CURRENT_USER_UPDATE?.();
}

function enable() {
	patchUser();
	
	UserStore.emitChange();
	UserStore.addChangeListener(patchUser);
}

function disable() {
	UserStore.removeChangeListener(patchUser);
	unpatchUser();
	updateDeveloperExperimentStore();
	UserStore.emitChange();
}

Settings.subscribe(Settings.expEnabled.get, () => {
	if (Settings.state.expEnabled) enable();
	else disable();
});

Plugin.onStart(() => {
	if (Settings.state.expEnabled) enable();
});

Plugin.onStop(() => {
	if (Settings.state.expEnabled) disable();
});
