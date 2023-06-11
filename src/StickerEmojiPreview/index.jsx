import css from "./styles";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Data, DOM, React, Patcher } from "@Api";

import patchPickerInspector from "./patches/patchPickerInspector";
import patchCloseExpressionPicker from "./patches/patchCloseExpressionPicker";

import SettingComponent from "./components/SettingComponent";

export default class StickerEmojiPreview {
	constructor() {
		Settings.init(config.settings);
	}

	start() {
		try {
			DOM.addStyle(css);
			patchPickerInspector();
			patchCloseExpressionPicker();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return (
			<SettingComponent
				description="Preview open by default."
				value={Settings.get("previewDefaultState")}
				onChange={e =>
					Settings.setMultiple({
						previewDefaultState: e,
						previewState: e
					})
				}
			/>
		);
	}
}
