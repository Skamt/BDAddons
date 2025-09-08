import "./styles";
import "./patches/*";
import { Patcher } from "@Api";
import { Store } from "./Store";
import Plugin, { Events } from "@Utils/Plugin";
// import React from "@React";
// import SettingComponent from "./components/SettingComponent";

// Plugin.getSettingsPanel = () => <SettingComponent />;

DEV: {
	window.FloatingChannelsStore = Store;
}

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
