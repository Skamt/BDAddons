import { getBySource } from "@Webpack";
import { getObjectKey } from "@Utils";
import { isValid } from "@common/Patcher/shared";
import {patchError} from "@Utils/Logger";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";
import { UNDEFINED_OBJECT_OR_KEY } from "@common/consts";

const SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");
const key = getObjectKey(SettingsMenuTransition, Number.isInteger);

Plugin.onStart(function handler() {
	if (!isValid(SettingsMenuTransition, key))	return patchError(handler);

	const origDelay = SettingsMenuTransition[key];

	function run() {
		if (!Settings.state.disableFade) {
			SettingsMenuTransition[key] = origDelay;
		} else SettingsMenuTransition[key] = 0;
	}

	run();
	const unsub = Settings.subscribe(Settings.selectors.disableFade, run);

	Plugin.onStop(
		() => {
			unsub();
			SettingsMenuTransition[key] = origDelay;
		},
		{ once: true },
	);
});
