import config from "@Config";
import React from "@React";
import { create, subscribeWithSelector } from "@Discord/zustand";
import { Data } from "@Api";
import { shallow } from "@Utils";

const SettingsStore = create(subscribeWithSelector(() => Object.assign(config.settings, Data.load("settings") || {})));

(state => {
	const selectors = {};
	const actions = {};

	for (const [key, value] of Object.entries(state)) {
		actions[`set${key}`] = newValue => SettingsStore.setState({ [key]: newValue });
		selectors[key] = state => state[key];
	}

	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);

})(SettingsStore.getInitialState());

SettingsStore.subscribe(
	state => state,
	() => Data.save("settings", SettingsStore.state)
);

Object.assign(SettingsStore, {
	useSetting: key => {
		const val = SettingsStore(state => state[key]);
		return [val, SettingsStore[`set${key}`]];
	}
});

DEV: {
	window.BDPluginSettings = window.BDPluginSettings || {};
	window.BDPluginSettings[config.info.name] = SettingsStore;
}

export default SettingsStore;
