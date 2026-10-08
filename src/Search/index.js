import "./patches/*";
import Plugin from "@common/Plugin";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { getModule } from "@Webpack";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
import { insertChild } from "@React";

const Dispatcher = getModule(a => a?.emitter?._events?.FOCUS_SEARCH, { searchExports: true });
function search(query) {
	Dispatcher.dispatch("SET_SEARCH_QUERY", {
		query,
		performSearch: false,
		focus: true,
		replace: true
	});
}

Plugin.onStart(() => {
	patch("user-context", (ret, { user, channel }) => {
		const channelId = SelectedChannelStore.getChannelId();
		if (!channelId) return;

		if (channel.isDM())
			return insertChild(
				ret,
				ContextMenu.buildItem({
					label: "Search messages",
					action() {
						search(`from:${user.id}`);
					}
				}),
				0
			);

		insertChild(
			ret,
			ContextMenu.buildItem({
				label: "Search",
				type:"submenu",
				items: [
					{
						label: "Messages in channel",
						action() {
							search(`in:${channel.id} from:${user.id}`);
						}
					},
					{
						label: "Messages in Server",
						action() {
							search(`from:${user.id}`);
						}
					}
				]
			}),
			0
		);
	});
});

module.exports = () => Plugin;
