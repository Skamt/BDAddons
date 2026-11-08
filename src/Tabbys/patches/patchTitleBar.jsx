import React from "@React";
import { rerenderComponent } from "@Utils/ReactUtils";
import { after } from "@common/Patcher";
import ErrorBoundary from "@Components/ErrorBoundary";
import { Filters, getModuleAndKey } from "@Webpack";
import App from "../components/App";
import Plugin from "@common/Plugin";

const TitleBar = getModuleAndKey(Filters.byStrings("getSystemUIDirection", "windowKey", "title"), {
	searchExports: true
});

Plugin.onStart(() => {
	after(...TitleBar, ({ args: [props], ret }) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [leading, title, trailing] = ret?.props?.children || [];

		return (
			<ErrorBoundary>
				<App
					leading={leading}
					title={title}
					trailing={trailing}
				/>
			</ErrorBoundary>
		);
	});

	rerenderComponent(TitleBar[0][TitleBar[1]]);
});

Plugin.onStop(() => rerenderComponent(TitleBar[0][TitleBar[1]]));
