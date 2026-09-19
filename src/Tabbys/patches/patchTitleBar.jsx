import React from "@React";
import { after } from "@common/Patcher";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import { Filters, getModule, getModuleAndKey } from "@Webpack";
import App from "../components/App";
import { reRender } from "@Utils";
import Plugin from "@common/Plugin";
import { transitionTo } from "@Discord/Modules";

const TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), {
	searchExports: true,
});
const BaseClasses = getModule(Filters.byKeys("base", "activityPanel"));

Plugin.onStart(() => {
	const { module, key } = TitleBar;

	after(module, key, ({ args: [props], ret }) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [leading, title, trailing] = ret?.props?.children || [];

		return (
			<ErrorBoundary>
				<App leading={leading} title={title} trailing={trailing} />
			</ErrorBoundary>
		);
	});

	setTimeout(() => reRender(`.${BaseClasses.base}`), 250);

	Plugin.onStop(() => reRender(`.${BaseClasses.base}`), { once: true });
});