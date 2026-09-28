import React from "@React";
import { after } from "@common/Patcher";
import ErrorBoundary from "@Components/ErrorBoundary";
import { Filters, getModule, getModuleAndKey } from "@Webpack";
import App from "../components/App";
import { reRender } from "@Utils";
import Plugin from "@common/Plugin";

const TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), {
	searchExports: true,
});
const BaseClasses = getModule(Filters.byKeys("bar", "winButton"));

Plugin.onStart(() => {

	after(...TitleBar, ({ args: [props], ret }) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [leading, title, trailing] = ret?.props?.children || [];

		return (
			<ErrorBoundary>
				<App leading={leading} title={title} trailing={trailing} />
			</ErrorBoundary>
		);
	});

	reRender(`.${BaseClasses.bar}[data-window-chrome]`)

});

	Plugin.onStop(() => reRender(`.tabbys-app-container`));
