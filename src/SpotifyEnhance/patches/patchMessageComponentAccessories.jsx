import { React, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { getModule, Filters } from "@Webpack";
import { isSpotifyUrl } from "@/Utils";
import Plugin, { Events } from "@Utils/Plugin";

const MessageComponentAccessories = getModule(Filters.byPrototypeKeys("renderPoll"), { searchExports: true });

const urlRegex = /((?:https?|steam):\/\/[^\s<]+[^<.,:;"'\]\s])/g;

export const MessageStateContext = React.createContext(null);


Plugin.on(Events.START, () => {
	if (!MessageComponentAccessories) return Logger.patchError("patchMessageComponentAccessories");
	const unpatches = [
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
		}),
		Patcher.after(MessageComponentAccessories.prototype, "renderEmbeds", (_, [message], ret) => {
			if (!ret || !message?.state) return;
			return <MessageStateContext.Provider value={message.state}>{ret}</MessageStateContext.Provider>;
		})
	];

	// biome-ignore lint/complexity/noForEach: <explanation>
	Plugin.once(Events.STOP, () => unpatches.forEach(a => a?.()));
});
