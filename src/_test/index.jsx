import { Filters, getDeclarationAndKey } from "@Webpack";
import { MessageHeader as MessageHeaderPromise } from "@Discord/Modules";

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, async () => {
	const MessageHeader = await MessageHeaderPromise;
	console.log(MessageHeader);
});

Plugin.on(Events.STOP, () => {});

module.exports = () => Plugin;
