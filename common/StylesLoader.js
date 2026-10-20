import Plugin from "@common/Plugin";
import { DOM } from "@Api";

const stylesLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};

Plugin.onStart(() => DOM.addStyle(stylesLoader._styles.join("\n")));
Plugin.onStop(() => DOM.removeStyle());

export default stylesLoader;
