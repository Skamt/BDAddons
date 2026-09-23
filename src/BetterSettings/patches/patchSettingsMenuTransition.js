import { getBySource } from "@Webpack";
import { hasOwn, getObjectKey } from "@Utils";

import { patchError } from "@Utils/Logger";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";
import { PATCH_ERROR } from "@common/consts";

const SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");
const key = getObjectKey(SettingsMenuTransition, Number.isInteger);

Plugin.onStart(() => {
	if (!hasOwn(SettingsMenuTransition, key)) return patchError(PATCH_ERROR);

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
