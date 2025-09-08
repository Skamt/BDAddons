import { ContextMenu, Patcher, Data, React } from "@Api";
import { copy, Disposable } from "@Utils";
import Toast from "@Utils/Toast";
import Logger from "@Utils/Logger";
import GuildRoleStore from "@Stores/GuildRoleStore";
import SelectedGuildStore from "@Stores/SelectedGuildStore";
import GuildMemberStore from "@Stores/GuildMemberStore";

import MessageHeader from "@Patch/MessageHeader";

let set = new Set();

function al(a, confirm) {
	BdApi.UI.showConfirmationModal("", a, {
		onConfirm: confirm,
		confirmText: "po"
	});
}

function confirm(guildId) {
	Data.save(guildId, [...(Data.load(guildId) || []), ...set]);
	set = new Set();
}

const emojiClickHandler = (e, emoji) => {
	const target = e.target;
	if (set.has(emoji)) {
		set.delete(emoji);
		target.style.border = "";
	} else {
		set.add(emoji);
		target.style.border = "2px solid red";
	}
};
function RolesList({ guild }) {

	const guildRoles = GuildRoleStore.getSortedRoles(guild.id).map(role => {
		const { id, colorString ,name } = role;
		return (
			<div
				className="guildRole"
				style={{
					"--c":colorString
				}}
				onClick={(e) => {
					emojiClickHandler(e, id);
				}}>
				{name}
			</div>
		);
	});

	return <div className="parentWrapper">{guildRoles}</div>;
}

export default class PinRoles extends Disposable {
	Init() {
		const { module, key } = MessageHeader;
		if (module && key)
			this.patches = [
				Patcher.after(module, key, (_, args, ret) => {
					if (!args[0].channel.guild_id || ret.props.value.includes("header bar")) return;
					const [{ channel, message }] = args;
					const guildId = channel.guild_id;
					const rolesForGuild = Data.load(guildId);
					if (!rolesForGuild) return;
					const guildRoles = GuildRoleStore.getSortedRoles(guildId);
					const memberRoles = GuildMemberStore.getMember(guildId, message.author.id)?.roles;
					if(!memberRoles) return;
					for (let i = 0; i < rolesForGuild.length; i++) {
						const targetRoleId = rolesForGuild[i];
						if (!memberRoles.includes(targetRoleId)) continue;
						const role = guildRoles.find(a => a.id === targetRoleId);
						ret.props.children.push(<span className="messageRoleHeader">{role.name}</span>);
					}
				}),
				ContextMenu.patch("guild-context", (retVal, { guild }) => {
					if (!guild) return;

					retVal.props.children.splice(
						1,
						0,
						ContextMenu.buildItem({
							label: "Pin Roles",
							action: () => al(<RolesList guild={guild} />, () => confirm(guild.id))
						})
					);
				})
			];
		else Logger.patchError("ShowUserId");
	}
}
