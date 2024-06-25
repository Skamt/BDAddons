import "./styles";
import { DOM, Patcher, React } from "@Api";
import Logger from "@Utils/Logger";
import SettingComponent from "./components/SettingComponent";
import patchVPPButton from "./patches/patchVPPButton";
import patchUserBannerMask from "./patches/patchUserBannerMask";

export default class ViewProfilePicture {
	start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			patchVPPButton();
			patchUserBannerMask();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
