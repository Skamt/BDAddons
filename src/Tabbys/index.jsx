import React from "@React";
import "./styles";
import "./patches/*";
import Plugin from "@common/Plugin";
import { Patcher } from "@Api";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;


module.exports = () => Plugin;
