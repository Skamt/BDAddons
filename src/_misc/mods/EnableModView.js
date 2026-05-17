import Logger from "@Utils/Logger";
import PermissionStore from "@Stores/PermissionStore";
import { Disposable } from "@Utils";
import { isSelf } from "@Utils/User";
import { Patcher } from "@Api";
import { Filters, getById, waitForModule, getModule } from "@Webpack";

// const a = getModule(a => a.useCanAccessGuildMemberModView);
// const d = getModule(Filters.byStrings("openGuildSidebar"), { searchExports: true });
// const a = getById(985925) ?? getModule(Filters.bySource("user:I,context:a,checkElevated:"));

// eslint-disable-next-line no-undef
let openModView;
waitForModule(Filters.byStrings("openGuildSidebar"), { searchExports: true }).then((a) => {
	openModView = a;
});

const filter = Filters.bySource("user:I,context:a,checkElevated:");
const modViewModule = waitForModule((a, _, id) => id === 985925 || filter(a));
async function enableModView() {
	await modViewModule;
	if (Plugin.stopped) return;
	for (const key in modViewModule) {
		this.patches.push(Patcher.after(a, key, () => true));
	}
}

export default class EnableModView extends Disposable {
	async Init() {
		enableModView();

		this.patches.push(
			Patcher.after(PermissionStore, "canAccessGuildSettings", () => true),
			Patcher.after(PermissionStore, "can", (_, args, ret) => (args[0] === 268435456n ? true : ret)),
		);

		this.patches.push(
			BdApi.ContextMenu.patch("user-context", (retVal, args) => {
				const { user, channel, guildId } = args;
				if (!isSelf(user)) return;
				if (!openModView) return;
				retVal.props.children.splice(
					1,
					0,
					BdApi.ContextMenu.buildItem({
						label: "Mod View",
						action: () => openModView(guildId, user.id, channel.id),
					}),
				);
			}),
		);
	}
}
