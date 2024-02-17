import { Data } from "@Api";
import ChangeEmitter from "@Utils/ChangeEmitter";

export default new (class Settings extends ChangeEmitter {
	init(defaultSettings) {
		this.settings = {
			...defaultSettings,
			...Data.load("settings")
		};
	}

	get(key) {
		return this.settings[key];
	}

	set(key, val) {
		this.settings[key] = val;
		this.commit();
	}

	setMultiple(newSettings) {
		this.settings = Object.assign(this.settings, newSettings);
		this.commit();
	}

	commit() {
		Data.save("settings", this.settings);
		this.emit();
	}
})();
