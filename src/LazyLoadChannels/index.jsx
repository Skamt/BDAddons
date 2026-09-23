import "./styles";
import "./patches/*";
import React from "@React";
import { Patcher } from "@Api";
import ChannelHandlers from "./ChannelHandlers";
import Dispatcher from "@Modules/Dispatcher";
import ChannelActions from "@Modules/ChannelActions";
import SettingComponent from "./components/SettingComponent";

import { EVENTS } from "./Constants";
import Plugin from "@common/Plugin";

Plugin.getSettingsPanel = () => <SettingComponent />;

Plugin.onStart(() => {
	ChannelHandlers.init();
	EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
});

Plugin.onStop(() => {
	ChannelHandlers.dispose();
	Patcher.unpatchAll();
	EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
});

module.exports = () => Plugin;
