import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
// import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Filters, getModuleAndKey } from "@Webpack";
import TabBar from "../components/TabBar";

const TitleBar = getModuleAndKey(Filters.byStrings("windowKey", "title"), { searchExports: true });

export default () => {
	const { module, key } = TitleBar;
	if (!module || !key) return Logger.patch("patchTitleBar");
	Patcher.before(module, key, (_, [props]) => {
		if(!props?.title) return;
		props.title = (
			<ErrorBoundary>
				<TabBar />
			</ErrorBoundary>
		);
	});
};
