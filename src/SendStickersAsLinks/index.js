import css from "./styles";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
import { MissingZlibAddon } from "@Utils";

import patchStickerClickability from "./patches/patchStickerClickability";
import patchSendSticker from "./patches/patchSendSticker";
import patchStickerComponent from "./patches/patchStickerComponent";
import patchStickerAttachement from "./patches/patchStickerAttachement";
import patchStickerSuggestion from "./patches/patchStickerSuggestion";
import patchChannelGuildPermissions from "./patches/patchChannelGuildPermissions";

export default !global.ZeresPluginLibrary ? MissingZlibAddon : (() => {
	const [Plugin] = global.ZeresPluginLibrary.buildPlugin(config);

	return class SendStickersAsLinks extends Plugin {
		constructor() {
			super();
		}

		onStart() {
			try {
				DOM.addStyle(css);
				patchStickerClickability();
				patchSendSticker();
				patchStickerComponent();
				patchStickerAttachement();
				patchStickerSuggestion();
				patchChannelGuildPermissions();
				Settings.init(this.settings);
			} catch (e) {
				Logger.error(e);
			}
		}

		onStop() {
			this.cleanUp?.();
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener(() => {
				Settings.update(this.settings);
			})
			return panel.getElement();
		}
	};
})()