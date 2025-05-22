import "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
// import FloatingWindows from "./FloatingWindows";
import patchContextMenu from "./patches/patchContextMenu";
import patchSomething , {cleanFluxContainer} from "./patches/patchSomething";
import { Store } from "./Store";

/*DEBUG*/
window.FloatingChannelsStore = Store;
/*DEBUG*/

const chatInputTypes = BdApi.Webpack.getByKeys("OVERLAY", "NORMAL", { searchExports: true });

function patchChatInputType() {
	const orig = { ...chatInputTypes.NORMAL };
	Object.defineProperty(chatInputTypes, "NORMAL", {
		get: () => Object.assign({}, orig, { analyticsName: crypto.randomUUID() })
	});

	return () => Object.defineProperty(chatInputTypes, "NORMAL", { value: orig });
}

export default class FloatingChannels {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchSomething();
			// reRender('div[data-windows="true"] > *');
			this.unpatchContextMenu = patchContextMenu();
			this.unpatchChatInputType = patchChatInputType();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Store.dispose();
		Patcher.unpatchAll();
		cleanFluxContainer();
		// reRender('div[data-windows="true"] > *');
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
		this.unpatchChatInputType();
		this.unpatchChatInputType = null;
	}
}

// const css = "";
