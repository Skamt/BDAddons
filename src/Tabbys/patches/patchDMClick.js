import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import Store from "@/Store";
import Settings from "@Utils/Settings";

const DMChannelFilter = Filters.byStrings("navigate", "location", "href", "createHref");
export const DMChannel = getModule(a => a.render && DMChannelFilter(a.render), { searchExports: true });

import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	if (!DMChannel) return Logger.patchError("DMChannel");
	Patcher.before(DMChannel, "render", (_, [props]) => {
		const path = props.to;
		if (!path) return;
		props.onClick = e => {
			if (e.ctrlKey&& Settings.state.ctrlClickChannel) {
				e.preventDefault();
				Store.newTab(path);
			}
		};
	});
});
