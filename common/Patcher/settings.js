import { patch } from "./shared";
import { nop } from "@Utils";
import Settings from "@Utils/Settings";

const getSettingsPatcher = (type) => {
	let unpatch = nop;
	return (object, key, callback, settingsKey) => {
		function _patch() {
			if (!Settings.state[settingsKey]) unpatch();
			else unpatch = patch(type, object, key, callback);
		}

		_patch();
		const unsub = Settings.subscribe(Settings.selectors[settingsKey], _patch);
		Plugin.onStop(unsub, { once: true });
	};
};

export const after = /*@__PURE__*/ getSettingsPatcher("after");
export const before = /*@__PURE__*/ getSettingsPatcher("before");
export const instead = /*@__PURE__*/ getSettingsPatcher("instead");
