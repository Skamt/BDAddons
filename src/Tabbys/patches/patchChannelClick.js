import { after } from "@common/Patcher";
import { reactRefMemoFilter, getModule } from "@Webpack";
import { getNestedProp } from "@Utils";
import Store from "@/Store";
import Plugin from "@common/Plugin";
import Settings from "@Utils/Settings";

const channelComponent = getModule(
	reactRefMemoFilter("render", "children", "onClick", "onKeyPress", "focusProps"),
	{ searchExports: true },
);

Plugin.onStart(() => {
	after(channelComponent, "render", ({ args: [props], ret }) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path = props.href;
		if (!path || !origClick) return ret;
		ret.props.children.props.onClick = (e) => {
			e.preventDefault();
			if (e.ctrlKey && Settings.state.ctrlClickChannel) Store.newTab(path);
			else origClick?.(e);
		};
	});
});
