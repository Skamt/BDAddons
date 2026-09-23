import React from "@React";
import { after } from "@common/Patcher";
import { lazy } from "@Webpack";
import { Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorFallbackComponent from "@/components/ErrorFallbackComponent";
import LazyLoaderComponent from "@/components/LazyLoaderComponent";
import Plugin from "@common/Plugin";
import ChannelStore from "@Stores/ChannelStore";

Plugin.onStart(() => {
	lazy(Filters.bySource(`name:"Channel",renderLoader`), 
		{ decFilter: Filters.byStrings("ChannelRenderer") })
	.then(ChannelRenderer => {
		after(...ChannelRenderer, ({ args, ret }) => {
			const channelId = args[0]?.match?.params?.channelId;
			const channel = ChannelStore.getChannel(channelId);
			if (!channel) return ret;

			return (
				<ErrorBoundary
					id="LazyLoaderComponent"
					fallback={ErrorFallbackComponent}>
					<LazyLoaderComponent
						key={channelId}
						channel={channel}
						ret={ret}
					/>
				</ErrorBoundary>
			);
		});
	});
});
