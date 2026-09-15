import { getBySource } from "@Webpack";
import { getObjectKey } from "@Utils";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

const SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");

Plugin.onStart(() => {
	const delayKey = getObjectKey(SettingsMenuTransition, Number.isInteger);
	if (!delayKey) return Logger.patchError("SettingsMenuTransition");
	const origDelay = SettingsMenuTransition[delayKey];

	function run() {
		if (!Settings.state.disableFade) {
			SettingsMenuTransition[delayKey] = origDelay;
		} else SettingsMenuTransition[delayKey] = 0;
	}

	run();
	const unsub = Settings.subscribe(Settings.selectors.disableFade, run);

	Plugin.onStop(() => {
		unsub();
		SettingsMenuTransition[delayKey] = origDelay;
	});
});
