import { Patcher } from "@Api";
import { buildTab } from "@/utils";
// import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { getNestedProp } from "@Utils";
import { Store } from "@/Store";

const channelFilter = Filters.byStrings("href", "children", "onClick", "onKeyPress", "focusProps");
export const channelComponent = getModule(a => a.render && channelFilter(a.render), { searchExports: true });

export default () => {
	if (!channelComponent) return Logger.patchError("channelComponent");
	Patcher.after(channelComponent, "render", (_, [props],ret) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path = props.href;
		if (!path || !origClick) return ret;
		ret.props.children.props.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey) Store.state.newTab(buildTab({ path }));
			else origClick?.(e);
		};
	});
};
