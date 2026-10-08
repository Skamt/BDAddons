import "./styles";
import "./patches/*";
import Plugin from "@common/Plugin";
import React from "@React";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => {
	// debugger;
	return <SettingComponent />;
};

module.exports = () => Plugin;
