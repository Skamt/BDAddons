import config from "@Config";
import React from "@React";
import { Patcher } from "@Api";
import { Filters, getDeclarationAndKey } from "@Webpack";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorFallbackComponent from "@/components/ErrorFallbackComponent";
import LazyLoaderComponent from "@/components/LazyLoaderComponent";

import Plugin, { Events } from "@Utils/Plugin";
import ChannelStore from "@Stores/ChannelStore";
import ChannelsStateManager from "@/ChannelsStateManager";

const ChannelRenderer = getDeclarationAndKey(Filters.bySource(`name:"Channel",renderLoader`), Filters.byStrings("ChannelRenderer"));

Plugin.on(Events.START, () => {
	const { module, key } = ChannelRenderer;
	if (!module || !key) return Logger.patchError("SpotifyChannelRenderer");
	Patcher.after(
		module,
		key,
		(
			_,
			[
				{
					match: {
						params: { channelId, guildId }
					}
				}
			],
			ret
		) => {
			
			const channel = ChannelStore.getChannel(channelId);
			if (!channel) return ret;

			return (
				<ErrorBoundary
					id="LazyLoaderComponent"
					passMetaProps
					fallback={ErrorFallbackComponent}
					plugin={config.info.name}>
					<LazyLoaderComponent
						key={channelId}
						channel={channel}
						ret={ret}
					/>
				</ErrorBoundary>
			);
		}
	);
});
