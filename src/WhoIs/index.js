import "./patches/*";
import { insertChild } from "@React";
import Plugin from "@common/Plugin";
import { before } from "@common/Patcher";
import { patch } from "@common/Patcher/contextmenu";
import { getModuleAndKey, Filters } from "@Webpack";
import _FetchUser from "@Modules/FetchUser";
import UserStore from "@Stores/UserStore";
import { showToast, queue, memoize } from "@Utils";
import Settings from "@Settings";
import SettingSwtich from "@Components/SettingSwtich";

const UserMention = getModuleAndKey(Filters.byStrings(".A.USER_MENTION),"));
const FetchUser = queue(memoize(_FetchUser), 3);

Plugin.onStart(() => {
	before(...UserMention, ({ args: [props] }) => {
		if (props.userId) return;
		props.userId = props.parsedUserId;
		if (Settings.state.autoload) if (!UserStore.getUser(props.userId)) FetchUser(props.userId);
	});

	patch("unknown-user-context", (retVal, { userId }) => {
		if (!userId) return;
		const MenuItem = BdApi.ContextMenu.buildItem({
			label: "Load User",
			action() {
				if (UserStore.getUser(userId)) return showToast("info", "User alreayd loaded");
				FetchUser(userId).then(
					() => showToast("success", "User Loaded!"),
					() => showToast("error", `Could not load user: ${userId}`)
				);
			}
		});

		insertChild(retVal, MenuItem, 0);
	});
});

Plugin.getSettingsPanel = () => () =>
	[
		{
			label: "Auto load unknown users",
			setting: Settings.autoload
		}
	].map(SettingSwtich);

module.exports = () => Plugin;
