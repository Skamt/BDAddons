// import zustand from "@Modules/zustand";
import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { Data } from "@Api";

const SettingsStoreSelectors = {};
const persistMiddleware = config => (set, get, api) => config(args => (set(args), Data.save("settings", get().getRawState())), get, api);

const SettingsStore = Object.assign(
	zustand(
		persistMiddleware(subscribeWithSelector((set, get) => {
					const settingsObj = Object.create(null);
		
					for (const [key, value] of Object.entries({
						...config.settings,
						...Data.load("settings")
					})) {
						settingsObj[key] = value;
						settingsObj[`set${key}`] = newValue => set({ [key]: newValue });
						SettingsStoreSelectors[key] = state => state[key];
					}
					settingsObj.getRawState = () => {
						return Object.entries(get())
							.filter(([, val]) => typeof val !== "function")
							.reduce((acc, [key, val]) => {
								acc[key] = val;
								return acc;
							}, {});
					};
					return settingsObj;
				}))
	),
	{
		useSetting: function (key) {
			return this(state => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);

Object.defineProperty(SettingsStore, "state", {
	writeable: false,
	configurable: false,
	get() {
		return this.getState();
	}
});

/*DEBUG*/
window.BDPluginSettings = window.BDPluginSettings || {};
window.BDPluginSettings[config.info.name] = SettingsStore;
/*DEBUG*/

export default SettingsStore;
