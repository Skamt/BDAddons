import config from "@Config";
import React from "@React";
import { Patcher } from "@Api";
import { Filters, waitForModule } from "@Webpack";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorFallbackComponent from "@/components/ErrorFallbackComponent";
import LazyLoaderComponent from "@/components/LazyLoaderComponent";

import Plugin, { Events } from "@Utils/Plugin";
import ChannelStore from "@Stores/ChannelStore";
import ChannelsStateManager from "@/ChannelsStateManager";

import { getObjectKey } from "@Utils";

Plugin.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource(`name:"Channel",renderLoader`), { signal: controller.signal, raw: true }).then(({ declarations: ChannelRenderer }) => {
		const key = getObjectKey(ChannelRenderer, Filters.byStrings("ChannelRenderer"));
		if (!key) return Logger.patchError("ChannelRenderer");

		Patcher.after(ChannelRenderer, key, (_, [{ match: { params: { channelId, guildId } } }],ret) => {
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
		});
	});
	Plugin.once(Events.STOP, () => controller.abort());
});
