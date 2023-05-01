import config from "@config";
import { Patcher, React } from "@Api";
import Logger from "@Utils/Logger";
import ChannelContent from "@Modules/ChannelContent";
import ErrorBoundary from "../components/ErrorBoundary";
import LazyLoaderComponent from "../components/LazyLoaderComponent";

export default context => {
	/**
	 * main patch for the plugin.
	 */
	if (ChannelContent)
		Patcher.after(ChannelContent, "type", (_, [{ channel }], ret) => {
			if (context.autoLoad) return;
			return (
				<ErrorBoundary
					id="LazyLoaderComponent"
					plugin={config.info.name}>
					<LazyLoaderComponent
						channel={channel}
						loadChannel={context.loadChannel}
						messages={ret.props.children.props.messages}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("patchChannelContent");
};
