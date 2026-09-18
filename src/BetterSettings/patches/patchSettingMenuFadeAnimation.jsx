import { waitForModule, Filters } from "@Webpack";
import { after as lazyAfter } from "@common/Patcher/lazy";
import { after } from "@common/Patcher";
import { getObjectKey, getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazyAfter(
		{
			sourceFilter: Filters.bySource(`"data-mana-component":"layer-modal"`),
			exportsFilter: () => true,
		},
		({ ret }) => {
			if (!Settings.state.disableFade) return;

			const target = getNestedProp(
				ret,
				"props.children.props.children.props.children.props.children.props",
			);
			if (!target) return;

			after(target, "children", ({ ret }) => <div {...ret.props} style={{}} />, true);
		},
	);
});
