import { getBySource } from "@Webpack";
import { getObjectKey } from "@Utils";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

const SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");

Plugin.on(Events.START, () => {
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

	Plugin.on(Events.STOP, () => {
		unsub();
		SettingsMenuTransition[delayKey] = origDelay;
	});
});
