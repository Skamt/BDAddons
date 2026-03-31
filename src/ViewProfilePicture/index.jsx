import "./styles";
import "./patches/*";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import React from "@React";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;
Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
