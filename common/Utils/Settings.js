import { Data } from "@Api";
import ChangeEmitter from "@Utils/ChangeEmitter";

export default new (class Settings extends ChangeEmitter {
	constructor() {
		super();
	}

	init(defaultSettings) {
		this.settings = Data.load("settings") || defaultSettings;
	}

	get(key) {
		return this.settings[key];
	}

	set(key, val) {
		this.settings[key] = val;
		this.commit();
	}
	setMultiple(newSettings) {
		this.settings = {
			...this.settings,
			...newSettings
		};
		this.commit();
	}

	commit() {
		Data.save("settings", this.settings);
		this.emit();
	}
})();
