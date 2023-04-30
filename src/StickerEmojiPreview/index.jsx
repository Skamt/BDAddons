import css from "./styles";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Data, DOM, React, Patcher } from "@Api";

import patchPickerInspector from "./patches/patchPickerInspector";
import patchCloseExpressionPicker from "./patches/patchCloseExpressionPicker";

import SettingComponent from "./components/SettingComponent"

export default class StickerEmojiPreview {
	constructor() {
		this.settings = Data.load("settings") || { previewState: false, previewDefaultState: false };
		Settings.init(this.settings);
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
				value={this.settings.previewDefaultState}
				onChange={e => {
					this.settings.previewDefaultState = e;
					this.settings.previewState = e;
					Settings.update(this.settings);
					Data.save("settings", this.settings);
				}}
			/>
		);
	}
}
