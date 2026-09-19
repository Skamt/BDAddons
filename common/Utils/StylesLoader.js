import Plugin from "@common/Plugin";
import { DOM } from "@Api";

const styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};

Plugin.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin.onStop(() => DOM.removeStyle());

export default styleLoader;
