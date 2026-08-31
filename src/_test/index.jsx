import { Patcher } from "@Api";
import React from "@React";
import { Filters, getDeclarationAndKey } from "@Webpack";
import { MessageHeader as MessageHeaderPromise } from "@Discord/Modules";
import Plugin, { Events } from "@Utils/Plugin";
import Flux from "@Utils/Flux";

Plugin.on(Events.START, async () => {
	Flux.init({
		GUILD_CREATE: console.log,
		GUILD_DELETE: console.log,
		CHANNEL_CREATE: console.log,
		CHANNEL_DELETE: console.log,
		RELATIONSHIP_ADD: console.log,
		RELATIONSHIP_UPDATE: console.log,
		CONNECTION_OPEN: console.log,
	});
});

Plugin.on(Events.STOP, () => {
	Flux.dispose();
});

module.exports = () => Plugin;
