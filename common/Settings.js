import config from "@Config";
import React from "@React";
import { map } from "@Utils/Object";
import { create, subscribeWithSelector } from "@Discord/zustand";
import { Data } from "@Api";

export default /*@__PURE__*/ (() => {
	const SettingsStore = create(subscribeWithSelector(() => Object.assign(config.settings || {}, Data.load("settings") || {})));

	Object.assign(
		SettingsStore,
		map(SettingsStore.getInitialState(), ({ key }) =>
			Object.assign(() => SettingsStore(state => state[key]), {
				key,
				get: () => SettingsStore.state[key],
				set: v => SettingsStore.setState({ [key]: v })
			})
		)
	);
	SettingsStore.subscribe(
		a => a,
		() => Data.save("settings", SettingsStore.state)
	);

	DEV: {
		window.BDPluginSettings = window.BDPluginSettings || {};
		window.BDPluginSettings[config.info.name] = SettingsStore;
	}

	return SettingsStore;
})();
