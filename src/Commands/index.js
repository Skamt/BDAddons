import "./patches/*";
import Plugin from "@common/Plugin";
import { nop } from "@Utils";
import { Commands } from "@Api";
import Toast from "@Utils/Toast";
import { ChannelUtils } from "@Discord/Modules";
import SelectedGuildStore from "@Stores/SelectedGuildStore";
import GuildStore from "@Stores/GuildStore";
import { getModule } from "@Webpack";

const { openUserProfileModal } = getModule(a => a.openUserProfileModal) || { openUserProfileModal: nop };

const commands = [
	{
		id: "open_user_dm",
		name: "message",
		description: "message user DM by their id",
		options: [
			{
				type: 3,
				name: "userId",
				description: "User Id",
				required: true
			}
		],
		execute([{ value }]) {
			if (!value) return Toast.error("Invalid user Id");
			ChannelUtils.openPrivateChannel({ recipientIds: [value] });
		}
	},
	{
		id: "find_server_owner",
		name: "owner",
		descriptionname: "find server owner",
		execute() {
			const guildId = SelectedGuildStore.getGuildId();
			const guild = GuildStore.getGuild(guildId);
			openUserProfileModal({ userId: guild.ownerId, guildId });
		}
	}
];

Plugin.onStart(() => {
	for (const command of commands) {
		Commands.register(command);
	}
});

Plugin.onStop(() => Commands.unregisterAll());

module.exports = () => Plugin;
