import { Data } from "@Api";

const Settings = {
	_listeners: [],
	_settings: {},
	_commit() {
		Data.save("settings", this._settings);
		this._notify();
	},
	_notify() {
		this._listeners.forEach(listener => listener?.());
	},
	get(key) {
		return this._settings[key];
	},
	set(key, val) {
		this._settings[key] = val;
		this._commit();
	},
	setMultiple(settings) {
		this._settings = {
			...this._settings,
			...settings
		};
		this._commit();
	},
	init(defaultSettings) {
		this._settings = Data.load("settings") || defaultSettings;
	},
	addUpdateListener(listener) {
		this._listeners.push(listener);
		return () => this._listeners.splice(this._listeners.length - 1, 1);
	}
};

export default Settings;
