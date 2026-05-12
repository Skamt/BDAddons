import "./styles";
import "./patches/*";
import React from "@React";
import { Patcher } from "@Api";

import ChannelsStateManager from "./ChannelsStateManager";
import ChannelHandlers from "./ChannelHandlers";
import Dispatcher from "@Modules/Dispatcher";
import ChannelActions from "@Modules/ChannelActions";
import SettingComponent from "./components/SettingComponent";

import { EVENTS } from "./Constants";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.getSettingsPanel = () => <SettingComponent />;

Plugin.on(Events.START, () => {
	ChannelHandlers.init();
	EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
});

Plugin.on(Events.STOP, () => {
	ChannelHandlers.dispose();
	Patcher.unpatchAll();
	EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
});

module.exports = () => Plugin;
