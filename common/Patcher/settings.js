import { patch } from "./shared";
import Settings from "@Utils/Settings";

const getSettingsPatcher = type => {
	const unpatchMap = new Map;
	return (object, key, callback, settingsKey) => {
		if(!callback || !settingsKey) return;
		function _patch() {
			if (!Settings.state[settingsKey]) unpatchMap.get(callback)?.();
			else unpatchMap.set(callback, patch(type, object, key, callback)) ;
		}

		_patch();
		const unsub = Settings.subscribe(Settings.selectors[settingsKey], _patch);
		Plugin.onStop(()=>{
			unsub();
			unpatchMap.delete(callback);
		}, { once: true });
	};
};

export const after = /*@__PURE__*/ getSettingsPatcher("after");
export const before = /*@__PURE__*/ getSettingsPatcher("before");
export const instead = /*@__PURE__*/ getSettingsPatcher("instead");
