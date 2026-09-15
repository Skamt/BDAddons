import { Filters } from "@Webpack";
import { lazyAfter } from "@Utils/Patcher";
import { getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazyAfter(
		{
			sourceFilter: Filters.bySource("SCROLLABLE_CUSTOM"),
			decFilter: Filters.byStrings("noticeRegionHiddenSidebar"),
		},
		function patchServerSettings({ ret }) {
			if (!Settings.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;

			ret.props.children = <div {...animatedDiv.props} />;
		},
	);
});
