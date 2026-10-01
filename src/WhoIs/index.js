import "./patches/*";
import Plugin from "@common/Plugin";
import { before } from "@common/Patcher";
import { getModuleAndKey, Filters } from "@Webpack";
import _FetchUser from "@Modules/FetchUser";
import UserStore from "@Stores/UserStore";
import { memoize } from "@Utils";
import { queue } from "@Utils/Tasks";

const UserMention = getModuleAndKey(Filters.byStrings(".A.USER_MENTION),"));
const FetchUser = queue(memoize(_FetchUser), 3);

Plugin.onStart(() => {
	before(...UserMention, ({ args: [props] }) => {
		if (props.userId) return;
		props.userId = props.parsedUserId;
		if (!UserStore.getUser(props.userId)) FetchUser(props.userId);
	});
});

module.exports = () => Plugin;
