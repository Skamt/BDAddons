import React from "@React";
import { isSpotifyUrl } from "@/utils";
import Plugin from "@common/Plugin";
import { before, after } from "@common/Patcher";
import { Filters, lazy } from "@Webpack";

const urlRegex = /((?:https?|steam):\/\/[^\s<]+[^<.,:;"'\]\s])/g;

export const MessageStateContext = React.createContext(null);

Plugin.onStart(() => {
	lazy(Filters.byPrototypeKeys("renderPoll"), { searchExports: true }).then(
		([m,k]) => {
			const MessageComponentAccessories = m[k];
			before(MessageComponentAccessories.prototype, "renderEmbeds", ({ args }) => {
				const message = args[0];
				const urlMatches = message.content.match(urlRegex) || [];
				if (!urlMatches.length) return;
				const embeds = urlMatches.filter(isSpotifyUrl).map((url) => ({
					url,
					type: "link",
					provider: {
						name: "Spotify",
						url: "https://spotify.com/",
					},
				}));

				if (!embeds.length) return;
				args[0] = Object.assign(args[0], {
					embeds: [...message.embeds.filter((a) => a.provider.name !== "Spotify"), ...embeds],
				});
			});

			after(MessageComponentAccessories.prototype, "renderEmbeds", ({ args: [message], ret }) => {
				if (!ret || !message?.state) return;
				return (
					<MessageStateContext value={message.state}>{ret}</MessageStateContext>
				);
			});
		},
	);
});
