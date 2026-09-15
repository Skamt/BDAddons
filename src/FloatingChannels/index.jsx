import "./styles";
import "./patches/*";
import { Patcher } from "@Api";
import { Store } from "./Store";
import Plugin from "@common/Plugin";
// import React from "@React";
// import SettingComponent from "./components/SettingComponent";

// Plugin.getSettingsPanel = () => <SettingComponent />;

DEV: {
	window.FloatingChannelsStore = Store;
}

Plugin.onStop(() => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
