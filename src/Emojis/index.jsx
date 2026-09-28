import "./patches/*";
import React from "@React";
import Plugin from "@common/Plugin";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;

module.exports = () => Plugin;
