import config from "@Config";
import { Patcher, findInTree, React } from "@Api";
import Logger from "@Utils/Logger";
import ChannelContent from "@Modules/ChannelContent";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorFallbackComponent from "../components/ErrorFallbackComponent";
import LazyLoaderComponent from "../components/LazyLoaderComponent";

export default context => {
	/**
	 * main patch for the plugin.
	 */
	if (ChannelContent)
		Patcher.after(ChannelContent, "type", (_, [{ channel }], ret) => {
			if (context.autoLoad) return;
			const messages = findInTree(ret, a => a.messages, { walkable: ["props", "children"] }).messages || [];
			return (
				<ErrorBoundary
					id="LazyLoaderComponent"
					passMetaProps
					fallback={ErrorFallbackComponent}
					plugin={config.info.name}>
					<LazyLoaderComponent
						channel={channel}
						loadChannel={context.loadChannel}
						messages={messages}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patchError("ChannelContent");
};
