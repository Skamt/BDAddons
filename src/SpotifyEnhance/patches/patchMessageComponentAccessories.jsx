import { React, Patcher } from "@Api";
import Logger from "@Utils/Logger";

import { isSpotifyUrl } from "@/Utils";
import Plugin, { Events } from "@Utils/Plugin";

import { getObjectKey } from "@Utils";
import { Filters, waitForModule } from "@Webpack";

// const MessageComponentAccessories = getModule(Filters.byPrototypeKeys("renderPoll"), { searchExports: true });

const urlRegex = /((?:https?|steam):\/\/[^\s<]+[^<.,:;"'\]\s])/g;

export const MessageStateContext = React.createContext(null);

Plugin.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.byPrototypeKeys("renderPoll"), { signal: controller.signal, searchExports: true }).then(MessageComponentAccessories => {
		Patcher.before(MessageComponentAccessories.prototype, "renderEmbeds", (_, args) => {
			const message = args[0];
			const urlMatches = message.content.match(urlRegex) || [];
			if (!urlMatches.length) return;
			const embeds = urlMatches.filter(isSpotifyUrl).map(url => ({
				url,
				"type": "link",
				"provider": {
					"name": "Spotify",
					"url": "https://spotify.com/"
				}
			}));

			if (!embeds.length) return;
			args[0] = Object.assign(args[0], {
				embeds: [...message.embeds.filter(a => a.provider.name !== "Spotify"), ...embeds]
			});
		});
		Patcher.after(MessageComponentAccessories.prototype, "renderEmbeds", (_, [message], ret) => {
			if (!ret || !message?.state) return;
			return <MessageStateContext.Provider value={message.state}>{ret}</MessageStateContext.Provider>;
		});
	});

	Plugin.once(Events.STOP, () => controller.abort());
});
