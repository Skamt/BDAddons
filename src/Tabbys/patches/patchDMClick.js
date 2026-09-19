import Plugin from "@common/Plugin";
import { before } from "@common/Patcher";
import { reactRefMemoFilter, getModule } from "@Webpack";
import Store from "@/Store";
import Settings from "@Utils/Settings";

const DMChannel = getModule(
	reactRefMemoFilter("render", "navigate", "location", "href", "createHref"),
	{ searchExports: true },
);

Plugin.onStart(() => {
	before(DMChannel, "render", ({args:[props]}) => {
		const path = props.to;
		if (!path) return;
		props.onClick = (e) => {
			if (e.ctrlKey && Settings.state.ctrlClickChannel) {
				e.preventDefault();
				Store.newTab(path);
			}
		};
	});
});
