import "./styles";
import "./patches/*";
import { Store } from "./Store";
import Plugin, { Events } from "@Utils/Plugin";
import SpotifyAPI from "@Utils/SpotifyAPI";
import React from "@React";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;

DEV: {
	window.spotstore = Store;
	window.SpotifyAPI = SpotifyAPI;
}

module.exports = () => Plugin;
