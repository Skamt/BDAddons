import Logger from "@Utils/Logger";
import PermissionStore from "@Stores/PermissionStore";
import { Disposable } from "@Utils";
import { isSelf } from "@Utils/User";
import { Patcher } from "@Api";
import { Filters,  getModule } from "@Webpack";

// const a = getModule(a => a.useCanAccessGuildMemberModView);
const d = getModule(Filters.byStrings("openGuildSidebar"), { searchExports: true });

// eslint-disable-next-line no-undef

export default class EnableModView extends Disposable {
	Init() {
		this.patches.push(
			Patcher.after(PermissionStore, "canAccessGuildSettings", () => true),
			Patcher.after(PermissionStore, "can", (_, args, ret) => (args[0] === 268435456n ? true : ret))
		);

		const a = s.getSource("checkElevated","user:","context:","getGuild","getCurrentUser","default")?.module?.exports;
		if (!a) return Logger.patchError("EnableModView");

		for (const key in a) {
			this.patches.push(Patcher.after(a, key, () => true));
		}

		this.patches.push(
			BdApi.ContextMenu.patch("user-context", (retVal, args) => {
				const { user, channel, guildId } = args;
				if (!isSelf(user)) return;
				retVal.props.children.splice(
					1,
					0,
					BdApi.ContextMenu.buildItem({
						label: "Mod View",
						action: () => d(guildId, user.id, channel.id)
					})
				);
			})
		);
	}
}
