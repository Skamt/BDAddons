import { lazy, Filters } from "@Webpack";
import { after, afterOnce } from "@common/Patcher";
import { getNestedProp } from "@Utils";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazy(Filters.byStrings(`"data-mana-component":"layer-modal"`), { searchExports: true }).then(
		(a) => {
			after(...a, ({ ret }) => {
				if (!Settings.state.disableFade) return;

				const target = getNestedProp(
					ret,
					"props.children.props.children.props.children.props.children.props",
				);
				if (!target) return;

				afterOnce(target, "children", ({ ret }) => <div {...ret.props} style={{}} />);
			});
		},
	);
});
