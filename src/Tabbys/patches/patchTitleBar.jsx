import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import { Filters, getModule, getModuleAndKey } from "@Webpack";
import App from "../components/App";
import { reRender } from "@Utils";
import Plugin, { Events } from "@Utils/Plugin";
import { transitionTo } from "@Discord/Modules";

const TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), { searchExports: true });
const BaseClasses = getModule(Filters.byKeys("base", "activityPanel"));

Plugin.on(Events.START, () => {
	const { module, key } = TitleBar;
	if (!module || !key) return Logger.patchError("patchTitleBar");
	Patcher.after(module, key, (_, [props], ret) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [, leading, trailing] = ret?.props?.children || [];

		return (
			<ErrorBoundary>
				<App
					leading={leading}
					trailing={trailing}
				/>
			</ErrorBoundary>
		);
	});
	reRender(`.${BaseClasses.base}`);
});

Plugin.on(Events.STOP, () => {
	reRender(`.${BaseClasses.base}`);
});
