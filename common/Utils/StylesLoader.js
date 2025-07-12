import Plugin, { Events } from "@Utils/Plugin";
import { DOM } from "@Api";

const styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};

Plugin.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});

Plugin.on(Events.STOP, () => {
	DOM.removeStyle();
});

export default styleLoader;
