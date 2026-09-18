import { Filters } from "@Webpack";
import { after } from "@common/Patcher/lazy";
import { getNestedProp } from "@Utils";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(
		{
			sourceFilter: Filters.bySource("SCROLLABLE_CUSTOM"),
			decFilter: Filters.byStrings("noticeRegionHiddenSidebar"),
		},
		function patchStandardSidebar({ ret }) {
			if (!Settings.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;

			ret.props.children = <div {...animatedDiv.props} />;
		},
	);
});
