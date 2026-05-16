import "./styles";
import "./patches/*";
import { Store } from "./Store";
import Plugin, { Events } from "@Utils/Plugin";
import SpotifyAPI from "@Utils/SpotifyAPI";
import React from "@React";
import SettingComponent from "./components/SettingComponent";
import { Patcher } from "@Api";

Plugin.getSettingsPanel = () => <SettingComponent />;
Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

DEV: {
	window.spotstore = Store;
	window.SpotifyAPI = SpotifyAPI;
}

module.exports = () => Plugin;
