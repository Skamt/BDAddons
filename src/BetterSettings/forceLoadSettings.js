import { getByPrototypeKeys, getByKeys } from "@Webpack";
import { Patcher } from "@Api";
import { nop } from "@Utils";
import Settings from "@Utils/Settings";

import Plugin, { Events } from "@Utils/Plugin";
const SettingMenuModal = getByKeys("openUserSettings", "USER_SETTINGS_MODAL_KEY");
const some = getByPrototypeKeys("renderNameZone", { searchExports: true });

const instance = some ? new some() : null;

async function forceLoadStuff() {
	await BdApi.Utils.loadEntry(SettingMenuModal.openUserSettings);
	instance && (await BdApi.Utils.loadEntry(instance.handleOpenSettingsContextMenu));
}

let forceLoadSettingsMenu = () => {
	if (!Settings.state.forceLoad) return;
	forceLoadSettingsMenu = nop;
	forceLoadStuff();
};

Plugin.on(Events.START, () => {
	forceLoadSettingsMenu();
	const unsub = Settings.subscribe(Settings.selectors.forceLoad, () => forceLoadSettingsMenu());
	Plugin.on(Events.STOP, () => unsub());
});
