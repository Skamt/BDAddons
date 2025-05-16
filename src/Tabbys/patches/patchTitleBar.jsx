import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
// import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Filters, getModuleAndKey } from "@Webpack";
import App from "../components/App";

const TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes","windowKey", "title"), { searchExports: true });

export default () => {
	const { module, key } = TitleBar;
	if (!module || !key) return Logger.patch("patchTitleBar");
	Patcher.after(module, key, (_, [props], ret) => {
		if (props.windowKey === "DISCORD_CHANNEL_CALL_POPOUT") return ret;
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
};
