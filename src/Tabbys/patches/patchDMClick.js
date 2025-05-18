import { Patcher } from "@Api";
import { buildTab } from "@/utils";
// import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";import { Store } from "@/Store";

const DMChannelFilter = Filters.byStrings("navigate", "location", "href", "createHref");
export const DMChannel = getModule(a => a.render && DMChannelFilter(a.render), { searchExports: true });

export default () => {

	if (!DMChannel) return Logger.patchError("DMChannel");
	Patcher.before(DMChannel, "render", (_, [props]) => {
		const origClick = props.onClick;
		const path = props.to;
		if (!path || !origClick) return;
		props.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey) Store.state.newTab(buildTab({ path }));
			else origClick();
		};
	});
};
