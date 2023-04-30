export default {
	settings: {},
	get(key){
		return this.settings[key];
	},
	set(key, val){
		return this.settings[key] = val;
	},
	update(settings){
		this.init(settings);
	},
	init(settings){
		this.settings = settings;
	}
}