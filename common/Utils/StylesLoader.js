import { DOM } from "@Api";

export default {
	_styles: [],

	Add(Id, styles) {
		this._styles.push([Id, styles]);
	},
	load() {
		DOM.addStyle(this._styles.map(([Id, styles]) => `/* ${Id} */\n${styles}`).join('\n'));
	},
	unload() {
		DOM.removeStyle();
	}
}