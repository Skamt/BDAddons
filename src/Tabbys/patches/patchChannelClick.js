import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { getNestedProp } from "@Utils";
import Store from "@/Store";
import Plugin, { Events } from "@Utils/Plugin";

const channelFilter = Filters.byStrings("href", "children", "onClick", "onKeyPress", "focusProps");
const channelComponent = getModule(a => a.render && channelFilter(a.render), { searchExports: true });

Plugin.on(Events.START, () => {
	if (!channelComponent) return Logger.patchError("channelComponent");
	Patcher.after(channelComponent, "render", (_, [props], ret) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path = props.href;
		if (!path || !origClick) return ret;
		ret.props.children.props.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey) Store.newTab(path);
			else origClick?.(e);
		};
	});
});
